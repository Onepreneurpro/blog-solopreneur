import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

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

    const campaignId = params.id;
    const body = await req.json();
    const { subject, content, triggerType, delayHours, delayMinutes, status, attachmentUrl, attachmentName, parentId } = body;

    if (!subject || !content) {
      return NextResponse.json({ error: 'Le sujet et le contenu de l email sont obligatoires' }, { status: 400 });
    }

    let calculatedStepOrder = 1;
    if (parentId) {
      const parentStep = await prisma.emailSequenceStep.findUnique({ where: { id: parentId } });
      if (parentStep) calculatedStepOrder = parentStep.stepOrder;
    } else {
      const existingCount = await prisma.emailSequenceStep.count({
        where: { campaignId, parentId: null },
      });
      calculatedStepOrder = existingCount + 1;
    }

    const parsedDelayHours = parseInt(String(delayHours), 10);
    const parsedDelayMinutes = parseInt(String(delayMinutes), 10);

    const newStep = await prisma.emailSequenceStep.create({
      data: {
        campaignId,
        stepOrder: calculatedStepOrder,
        subject: String(subject).trim(),
        content: String(content).trim(),
        triggerType: triggerType ? String(triggerType) : 'IMMEDIATE',
        delayHours: !isNaN(parsedDelayHours) ? parsedDelayHours : 0,
        delayMinutes: !isNaN(parsedDelayMinutes) ? parsedDelayMinutes : 0,
        status: status ? String(status) : 'ACTIVE',
        attachmentUrl: attachmentUrl ? String(attachmentUrl) : null,
        attachmentName: attachmentName ? String(attachmentName) : null,
        parentId: parentId ? String(parentId) : null,
      },
    });

    return NextResponse.json({ success: true, sequence: newStep });
  } catch (error: any) {
    console.error('Error creating sequence step:', error);
    return NextResponse.json({ error: error?.message || "Erreur lors de la création de la séquence d'email" }, { status: 500 });
  }
}
