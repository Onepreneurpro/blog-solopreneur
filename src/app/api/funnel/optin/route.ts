import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { funnelId, stepId, email, name } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email obligatoire' }, { status: 400 });
    }

    // 1. Create or update Lead Contact
    const existingLead = await prisma.lead.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    let lead;
    if (!existingLead) {
      lead = await prisma.lead.create({
        data: {
          email: email.toLowerCase().trim(),
          firstName: name || null,
          source: 'TUNNEL_OPTIN',
          status: 'SUBSCRIBED',
        },
      });
    } else {
      lead = existingLead;
    }

    // 2. Fetch step & automation rules
    const step = await prisma.funnelStep.findUnique({
      where: { id: stepId },
      include: {
        automationRules: true,
        funnel: {
          include: {
            steps: {
              orderBy: { position: 'asc' },
            },
          },
        },
      },
    });

    if (step) {
      // Increment step conversions
      await prisma.funnelStep.update({
        where: { id: step.id },
        data: { conversionsCount: { increment: 1 } },
      });

      // Execute automation rules
      for (const rule of step.automationRules) {
        if (rule.triggerType === 'OPTIN' && rule.actionType === 'SUBSCRIBE_CAMPAIGN' && rule.targetId) {
          // Check campaign sequence step 1
          const firstSeqStep = await prisma.emailSequenceStep.findFirst({
            where: {
              campaignId: rule.targetId,
              status: 'ACTIVE',
            },
            orderBy: { stepOrder: 'asc' },
          });

          if (firstSeqStep) {
            // Queue welcome email
            const scheduledAt = new Date();
            if (firstSeqStep.triggerType === 'DELAYED') {
              scheduledAt.setHours(scheduledAt.getHours() + (firstSeqStep.delayHours || 0));
              scheduledAt.setMinutes(scheduledAt.getMinutes() + (firstSeqStep.delayMinutes || 0));
            }

            await prisma.emailSequenceQueue.create({
              data: {
                campaignId: rule.targetId,
                stepId: firstSeqStep.id,
                leadEmail: lead.email,
                leadFirstName: lead.firstName || 'Abonné',
                scheduledAt,
                status: 'PENDING',
              },
            });
          }
        }
      }

      // Find next step in funnel (e.g. Thank you page)
      const currentPos = step.position;
      const nextStep = step.funnel.steps.find((s) => s.position > currentPos);

      return NextResponse.json({
        success: true,
        nextStepSlug: nextStep ? nextStep.slug : null,
        funnelSlug: step.funnel.slug,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error submitting funnel optin:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
