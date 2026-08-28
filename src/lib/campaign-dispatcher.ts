import { prisma } from '@/lib/prisma';
import { sendEmailViaSmtp, SmtpServerConfig } from '@/lib/smtp';
import { injectTrackingToEmailHtml } from '@/lib/email-tracking';
import path from 'path';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function triggerCampaignSequencesForLead({
  leadEmail,
  leadFirstName,
  leadLastName,
  leadName,
  listId,
  welcomeStepId,
}: {
  leadEmail: string;
  leadFirstName?: string | null;
  leadLastName?: string | null;
  leadName?: string | null;
  listId: string;
  welcomeStepId?: string | null;
}) {
  try {
    if (!leadEmail || !listId) return;

    // 1. Find all ACTIVE campaigns bound to this lead list
    const campaigns = await prisma.emailCampaign.findMany({
      where: {
        status: 'ACTIVE',
        lists: {
          some: {
            listId: listId,
          },
        },
      },
      include: {
        smtpServer: true,
        sequences: {
          where: {
            status: 'ACTIVE',
          },
          include: {
            variants: {
              where: { status: 'ACTIVE' },
            },
          },
          orderBy: { stepOrder: 'asc' },
        },
      },
    });

    if (campaigns.length === 0) {
      console.log(`[Campaign Dispatcher] Aucune campagne active liée à la liste ${listId}`);
      return;
    }

    // 2. Fetch default SMTP server if campaign does not specify one
    const defaultSmtpServer = await prisma.smtpServer.findFirst({
      where: { isDefault: true },
    }) || await prisma.smtpServer.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    // Parse Prénom & Nom
    let pFirstName = (leadFirstName || '').trim();
    let pLastName = (leadLastName || '').trim();

    if (!pFirstName && !pLastName && leadName) {
      const parts = leadName.trim().split(' ');
      pFirstName = parts[0] || '';
      pLastName = parts.slice(1).join(' ') || '';
    }

    const fullName = `${pFirstName} ${pLastName}`.trim() || pFirstName || pLastName || 'Abonné';

    const replaceTags = (text: string) => {
      const unsubUrl = `${baseUrl}/desabonnement?email=${encodeURIComponent(leadEmail)}`;
      const unsubLink = `<a href="${unsubUrl}" style="color: #64748b; text-decoration: underline; font-weight: bold;">Se désabonner de cette séquence</a>`;

      return text
        .replace(/\{prenom\}/gi, pFirstName || 'Abonné')
        .replace(/\{firstname\}/gi, pFirstName || 'Abonné')
        .replace(/\{nom\}/gi, pLastName || '')
        .replace(/\{lastname\}/gi, pLastName || '')
        .replace(/\{nom_complet\}/gi, fullName)
        .replace(/\{fullname\}/gi, fullName)
        .replace(/\{desabonner\}/gi, unsubLink)
        .replace(/\{desabonnement\}/gi, unsubLink)
        .replace(/\{unsubscribe\}/gi, unsubLink);
    };

    for (const campaign of campaigns) {
      const targetSmtp = campaign.smtpServer || defaultSmtpServer;

      if (!targetSmtp) {
        console.warn(`[Campaign Dispatcher] Serveur SMTP manquant pour la campagne "${campaign.name}"`);
        continue;
      }

      if (!campaign.sequences || campaign.sequences.length === 0) {
        console.log(`[Campaign Dispatcher] Aucun message dans la séquence pour la campagne "${campaign.name}"`);
        continue;
      }

      // Filter top-level steps (parentId == null)
      const topLevelSteps = campaign.sequences.filter((s) => !s.parentId);
      
      // Determine which immediate welcome email variant to dispatch:
      let targetWelcomeStep: any = null;

      if (welcomeStepId) {
        for (const s of campaign.sequences) {
          if (s.id === welcomeStepId) {
            targetWelcomeStep = s;
            break;
          }
          if (s.variants) {
            const vMatch = s.variants.find((v) => v.id === welcomeStepId);
            if (vMatch) {
              targetWelcomeStep = vMatch;
              break;
            }
          }
        }
      }

      if (!targetWelcomeStep) {
        const step1 = topLevelSteps.find((s) => s.stepOrder === 1 || s.triggerType === 'IMMEDIATE');
        if (step1) {
          if (step1.variants && step1.variants.length > 0) {
            targetWelcomeStep = step1.variants[0];
          } else {
            targetWelcomeStep = step1;
          }
        }
      }

      const smtpConfig: SmtpServerConfig = {
        id: targetSmtp.id,
        name: targetSmtp.name,
        host: targetSmtp.host,
        port: targetSmtp.port,
        username: targetSmtp.username,
        password: targetSmtp.password,
        encryption: targetSmtp.encryption,
        fromEmail: targetSmtp.fromEmail,
        fromName: targetSmtp.fromName,
      };

      // A. DISPATCH IMMEDIATE WELCOME EMAIL
      if (targetWelcomeStep) {
        const parsedSubject = replaceTags(targetWelcomeStep.subject);
        const formattedBodyHtml = replaceTags(targetWelcomeStep.content).replace(/\n/g, '<br />');

        const unsubUrl = `${baseUrl}/desabonnement?email=${encodeURIComponent(leadEmail)}`;

        const fullHtml = `
          <div style="font-family: Arial, sans-serif; font-size: 14px; color: #1e293b; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
            <div style="margin-bottom: 20px; border-bottom: 2px solid #7c3aed; padding-bottom: 10px;">
              <h2 style="color: #4c1d95; font-size: 18px; margin: 0;">${targetSmtp.fromName}</h2>
            </div>
            <div style="font-size: 14px; color: #334155;">
              ${formattedBodyHtml}
            </div>
            <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8; text-align: center;">
              Cet email vous a été envoyé automatiquement suite à votre inscription sur Solopreneur&Co.<br />
              <a href="${unsubUrl}" style="color: #64748b; text-decoration: underline; font-weight: bold; margin-top: 6px; display: inline-block;">
                Se désabonner de cette séquence d emails
              </a>
            </div>
          </div>
        `;

        let mailAttachments: Array<{ filename: string; path: string }> = [];
        if (targetWelcomeStep.attachmentUrl) {
          let attachPath = targetWelcomeStep.attachmentUrl;
          if (attachPath.startsWith('/uploads/') || attachPath.startsWith('/')) {
            attachPath = path.join(process.cwd(), 'public', attachPath);
          }
          mailAttachments.push({
            filename: targetWelcomeStep.attachmentName || path.basename(attachPath),
            path: attachPath,
          });
        }

        const trackedHtml = injectTrackingToEmailHtml({
          html: fullHtml,
          baseUrl,
          email: leadEmail,
          stepId: targetWelcomeStep.id,
        });

        console.log(`[Campaign Dispatcher] Envoi email de bienvenue via SMTP (${targetSmtp.name}) à ${leadEmail}...`);

        const sendResult = await sendEmailViaSmtp({
          config: smtpConfig,
          to: leadEmail,
          subject: parsedSubject,
          html: trackedHtml,
          attachments: mailAttachments.length > 0 ? mailAttachments : undefined,
        });

        if (sendResult.success) {
          console.log(`[Campaign Dispatcher] ✅ Email envoyé à ${leadEmail} (MessageId: ${sendResult.messageId})`);
          await prisma.emailSequenceStep.update({
            where: { id: targetWelcomeStep.id },
            data: { sentCount: { increment: 1 } },
          }).catch(() => {});
        } else {
          console.error(`[Campaign Dispatcher] ❌ Échec d envoi email via SMTP: ${sendResult.error}`);
        }
      }

      // B. SCHEDULE ALL DELAYED SEQUENCE STEPS CUMULATIVELY RELATIVE TO PREVIOUS EMAILS
      const sortedTopSteps = [...topLevelSteps].sort((a, b) => a.stepOrder - b.stepOrder);

      // Base time starts at signup/welcome email time
      let accumBaseTime = new Date();

      for (const step of sortedTopSteps) {
        if (step.stepOrder === 1 || step.triggerType === 'IMMEDIATE') {
          continue;
        }

        const stepDelayMins = (step.delayMinutes && step.delayMinutes > 0)
          ? step.delayMinutes
          : (step.delayHours * 60);

        const minDelay = Math.max(stepDelayMins, 1);
        
        const stepScheduledAt = new Date(accumBaseTime.getTime() + minDelay * 60 * 1000);
        accumBaseTime = stepScheduledAt;

        await prisma.emailSequenceQueue.create({
          data: {
            campaignId: campaign.id,
            stepId: step.id,
            leadEmail,
            leadFirstName: pFirstName || null,
            leadLastName: pLastName || null,
            scheduledAt: stepScheduledAt,
            status: 'PENDING',
          },
        });

        console.log(`[Campaign Dispatcher] ⌛ Étape "${step.subject}" (Email #${step.stepOrder}) programmée le ${stepScheduledAt.toISOString()} (${stepDelayMins} min après l email précédent)`);
      }

    }
  } catch (error) {
    console.error('[Campaign Dispatcher] Erreur lors du déclenchement automatique des séquences:', error);
  }
}

/**
 * PROCESS ALL PENDING SEQUENCE QUEUE EMAILS THAT ARE DUE
 */
export async function processPendingSequenceQueue() {
  let sentCount = 0;
  let failedCount = 0;

  try {
    const dueItems = await prisma.emailSequenceQueue.findMany({
      where: {
        status: 'PENDING',
        scheduledAt: { lte: new Date() },
      },
      include: {
        campaign: {
          include: { smtpServer: true },
        },
        step: true,
      },
      take: 50,
    });

    if (dueItems.length === 0) {
      return { processed: 0, sentCount: 0, failedCount: 0 };
    }

    const processedLeadsThisBatch = new Set<string>();

    const defaultSmtpServer = await prisma.smtpServer.findFirst({
      where: { isDefault: true },
    }) || await prisma.smtpServer.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    for (const item of dueItems) {
      if (item.campaign && item.campaign.status === 'PAUSED') {
        console.log(`[Queue Processor] ⏸️ La campagne "${item.campaign.name}" est EN PAUSE. L envoi de l email "${item.step?.subject || ''}" est suspendu.`);
        continue;
      }

      if (processedLeadsThisBatch.has(item.leadEmail)) {
        console.log(`[Queue Processor] ⏳ Lead ${item.leadEmail} a déjà reçu un email dans ce cycle. Report de l email suivant au prochain délai.`);
        continue;
      }

      // Check if lead is blocked, unsubscribed, or deleted
      const leadRecord = await prisma.lead.findUnique({
        where: { email: item.leadEmail },
      });

      if (!leadRecord) {
        console.log(`[Queue Processor] 🗑️ Lead ${item.leadEmail} introuvable (supprimé). Annulation de l envoi de l email.`);
        await prisma.emailSequenceQueue.update({
          where: { id: item.id },
          data: { status: 'CANCELLED' },
        });
        continue;
      }

      if (leadRecord.status === 'BLOCKED') {
        console.log(`[Queue Processor] ⏸️ Lead ${item.leadEmail} est BLOQUÉ. L envoi de l email "${item.step.subject}" est suspendu.`);
        continue;
      }
      if (leadRecord.status === 'UNSUBSCRIBED') {
        console.log(`[Queue Processor] 🚫 Lead ${item.leadEmail} est DÉSABONNÉ. Annulation de l envoi.`);
        await prisma.emailSequenceQueue.update({
          where: { id: item.id },
          data: { status: 'CANCELLED' },
        });
        continue;
      }

      const targetSmtp = item.campaign.smtpServer || defaultSmtpServer;

      if (!targetSmtp) {
        await prisma.emailSequenceQueue.update({
          where: { id: item.id },
          data: { status: 'FAILED', error: 'Serveur SMTP manquant' },
        });
        failedCount++;
        continue;
      }

      const pFirstName = item.leadFirstName || '';
      const pLastName = item.leadLastName || '';
      const fullName = `${pFirstName} ${pLastName}`.trim() || pFirstName || pLastName || 'Abonné';

      const replaceTags = (text: string) => {
        const unsubUrl = `${baseUrl}/desabonnement?email=${encodeURIComponent(item.leadEmail)}`;
        const unsubLink = `<a href="${unsubUrl}" style="color: #64748b; text-decoration: underline; font-weight: bold;">Se désabonner de cette séquence</a>`;

        return text
          .replace(/\{prenom\}/gi, pFirstName || 'Abonné')
          .replace(/\{firstname\}/gi, pFirstName || 'Abonné')
          .replace(/\{nom\}/gi, pLastName || '')
          .replace(/\{lastname\}/gi, pLastName || '')
          .replace(/\{nom_complet\}/gi, fullName)
          .replace(/\{fullname\}/gi, fullName)
          .replace(/\{desabonner\}/gi, unsubLink)
          .replace(/\{desabonnement\}/gi, unsubLink)
          .replace(/\{unsubscribe\}/gi, unsubLink);
      };

      const parsedSubject = replaceTags(item.step.subject);
      const formattedBodyHtml = replaceTags(item.step.content).replace(/\n/g, '<br />');

      const unsubUrl = `${baseUrl}/desabonnement?email=${encodeURIComponent(item.leadEmail)}`;

      const fullHtml = `
        <div style="font-family: Arial, sans-serif; font-size: 14px; color: #1e293b; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <div style="margin-bottom: 20px; border-bottom: 2px solid #7c3aed; padding-bottom: 10px;">
            <h2 style="color: #4c1d95; font-size: 18px; margin: 0;">${targetSmtp.fromName}</h2>
          </div>
          <div style="font-size: 14px; color: #334155;">
            ${formattedBodyHtml}
          </div>
          <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8; text-align: center;">
            Cet email vous a été envoyé automatiquement suite à votre inscription sur Solopreneur&Co.<br />
            <a href="${unsubUrl}" style="color: #64748b; text-decoration: underline; font-weight: bold; margin-top: 6px; display: inline-block;">
              Se désabonner de cette séquence d emails
            </a>
          </div>
          <img src="${baseUrl}/api/track/open?queueId=${item.id}&email=${encodeURIComponent(item.leadEmail)}" width="1" height="1" style="display:none; width:1px; height:1px;" alt="" />
        </div>
      `;

      let mailAttachments: Array<{ filename: string; path: string }> = [];
      if (item.step.attachmentUrl) {
        let attachPath = item.step.attachmentUrl;
        if (attachPath.startsWith('/uploads/') || attachPath.startsWith('/')) {
          attachPath = path.join(process.cwd(), 'public', attachPath);
        }
        mailAttachments.push({
          filename: item.step.attachmentName || path.basename(attachPath),
          path: attachPath,
        });
      }

      const smtpConfig: SmtpServerConfig = {
        id: targetSmtp.id,
        name: targetSmtp.name,
        host: targetSmtp.host,
        port: targetSmtp.port,
        username: targetSmtp.username,
        password: targetSmtp.password,
        encryption: targetSmtp.encryption,
        fromEmail: targetSmtp.fromEmail,
        fromName: targetSmtp.fromName,
      };

      const trackedHtml = injectTrackingToEmailHtml({
        html: fullHtml,
        baseUrl,
        queueId: item.id,
        email: item.leadEmail,
        stepId: item.stepId,
      });

      const sendResult = await sendEmailViaSmtp({
        config: smtpConfig,
        to: item.leadEmail,
        subject: parsedSubject,
        html: trackedHtml,
        attachments: mailAttachments.length > 0 ? mailAttachments : undefined,
      });

      if (sendResult.success) {
        processedLeadsThisBatch.add(item.leadEmail);
        const actualSentAt = new Date();

        await prisma.emailSequenceQueue.update({
          where: { id: item.id },
          data: { status: 'SENT', sentAt: actualSentAt },
        });

        await prisma.emailSequenceStep.update({
          where: { id: item.stepId },
          data: { sentCount: { increment: 1 } },
        }).catch(() => {});

        // Re-adjust next queued step's scheduledAt relative to THIS actual delivery time
        const nextItem = await prisma.emailSequenceQueue.findFirst({
          where: {
            campaignId: item.campaignId,
            leadEmail: item.leadEmail,
            status: 'PENDING',
          },
          include: { step: true },
          orderBy: { step: { stepOrder: 'asc' } },
        });

        if (nextItem && nextItem.step) {
          const nextStepDelayMins = (nextItem.step.delayMinutes && nextItem.step.delayMinutes > 0)
            ? nextItem.step.delayMinutes
            : (nextItem.step.delayHours * 60);

          const newNextScheduledAt = new Date(actualSentAt.getTime() + Math.max(nextStepDelayMins, 1) * 60 * 1000);

          await prisma.emailSequenceQueue.update({
            where: { id: nextItem.id },
            data: { scheduledAt: newNextScheduledAt },
          });

          console.log(`[Queue Processor] ⏱️ Prochain email "${nextItem.step.subject}" ré-ajusté à ${newNextScheduledAt.toISOString()} (${nextStepDelayMins} min après l envoi effectif de cet email)`);
        }

        sentCount++;
        console.log(`[Queue Processor] ✅ Email de séquence différée envoyé avec succès à ${item.leadEmail}`);
      } else {
        await prisma.emailSequenceQueue.update({
          where: { id: item.id },
          data: { status: 'FAILED', error: sendResult.error || 'Erreur SMTP' },
        });
        failedCount++;
        console.error(`[Queue Processor] ❌ Échec d envoi email différé: ${sendResult.error}`);
      }
    }
  } catch (err) {
    console.error('[Queue Processor] Erreur lors du traitement de la file d attente:', err);
  }

  return { processed: sentCount + failedCount, sentCount, failedCount };
}
