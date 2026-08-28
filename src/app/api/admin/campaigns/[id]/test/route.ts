import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { sendEmailViaSmtp, SmtpServerConfig } from '@/lib/smtp';

export const dynamic = 'force-dynamic';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const recipient = body.recipient || currentUser.email;

    const campaign = await prisma.emailCampaign.findUnique({
      where: { id },
      include: {
        smtpServer: true,
        sequences: {
          orderBy: { stepOrder: 'asc' },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campagne introuvable' }, { status: 404 });
    }

    // Determine SMTP Server
    let targetSmtp = campaign.smtpServer;
    if (!targetSmtp) {
      targetSmtp = await prisma.smtpServer.findFirst({
        where: { isDefault: true },
      }) || await prisma.smtpServer.findFirst({
        orderBy: { createdAt: 'desc' },
      });
    }

    if (!targetSmtp) {
      return NextResponse.json({
        error: 'Aucun serveur SMTP configuré. Veuillez en ajouter un dans les Paramètres.',
      }, { status: 400 });
    }

    const firstSequenceStep = campaign.sequences[0];
    const subject = firstSequenceStep ? firstSequenceStep.subject : `[Test] Campagne ${campaign.name}`;
    const rawBody = firstSequenceStep
      ? firstSequenceStep.content
      : `Bonjour,\n\nCeci est un test de la campagne ${campaign.name}.\n\nSolopreneur&Co`;

    const parsedSubject = subject.replace(/\{prenom\}/gi, currentUser.name || 'Admin');
    const formattedHtml = rawBody.replace(/\{prenom\}/gi, currentUser.name || 'Admin').replace(/\n/g, '<br />');

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

    const sendResult = await sendEmailViaSmtp({
      config: smtpConfig,
      to: recipient,
      subject: `[TEST] ${parsedSubject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <div style="background-color: #f3e8ff; border: 1px solid #d8b4fe; padding: 10px 15px; rounded-radius: 8px; margin-bottom: 20px;">
            <strong style="color: #6b21a8; font-size: 12px;">⚡ TEST D ENVOI RÉEL DE CAMPAGNE</strong>
            <p style="margin: 3px 0 0 0; font-size: 11px; color: #581c87;">Serveur SMTP utilisé : <strong>${targetSmtp.name}</strong> (${targetSmtp.fromEmail})</p>
          </div>
          <div style="font-size: 14px; color: #1e293b; line-height: 1.6;">
            ${formattedHtml}
          </div>
        </div>
      `,
    });

    if (!sendResult.success) {
      return NextResponse.json({ error: sendResult.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Email réel de test envoyé avec succès à ${recipient} via ${targetSmtp.name} !`,
    });
  } catch (error: any) {
    console.error('Error testing campaign email:', error);
    return NextResponse.json({ error: error?.message || 'Échec de l envoi de test' }, { status: 500 });
  }
}
