import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(
  req: Request,
  { params }: { params: { id: string; sequenceId: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { sequenceId } = params;
    const body = await req.json();
    const { subject, content, triggerType, delayHours, delayMinutes, status, stepOrder, attachmentUrl, attachmentName } = body;

    const dataToUpdate: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (typeof subject === 'string' && subject.trim()) {
      dataToUpdate.subject = subject.trim();
    }
    if (typeof content === 'string' && content.trim()) {
      dataToUpdate.content = content.trim();
    }
    if (typeof triggerType === 'string' && triggerType) {
      dataToUpdate.triggerType = triggerType;
    }
    if (typeof status === 'string' && status) {
      dataToUpdate.status = status;
    }

    if (delayHours !== undefined && delayHours !== null) {
      const parsedHours = parseInt(String(delayHours), 10);
      if (!isNaN(parsedHours)) {
        dataToUpdate.delayHours = parsedHours;
      }
    }

    if (delayMinutes !== undefined && delayMinutes !== null) {
      const parsedMinutes = parseInt(String(delayMinutes), 10);
      if (!isNaN(parsedMinutes)) {
        dataToUpdate.delayMinutes = parsedMinutes;
      }
    }

    if (stepOrder !== undefined && stepOrder !== null) {
      const parsedOrder = parseInt(String(stepOrder), 10);
      if (!isNaN(parsedOrder)) {
        dataToUpdate.stepOrder = parsedOrder;
      }
    }

    if (attachmentUrl !== undefined) {
      dataToUpdate.attachmentUrl = attachmentUrl ? String(attachmentUrl) : null;
    }

    if (attachmentName !== undefined) {
      dataToUpdate.attachmentName = attachmentName ? String(attachmentName) : null;
    }

    const updated = await prisma.emailSequenceStep.update({
      where: { id: sequenceId },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, sequence: updated });
  } catch (error: any) {
    console.error('Error updating sequence step:', error);
    return NextResponse.json({ error: error?.message || 'Erreur lors de la modification de la séquence d email' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string; sequenceId: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { sequenceId } = params;
    await prisma.emailSequenceStep.delete({
      where: { id: sequenceId },
    });

    return NextResponse.json({ success: true, message: 'Étape de séquence supprimée' });
  } catch (error: any) {
    console.error('Error deleting sequence step:', error);
    return NextResponse.json({ error: error?.message || 'Erreur lors de la suppression de l étape' }, { status: 500 });
  }
}
