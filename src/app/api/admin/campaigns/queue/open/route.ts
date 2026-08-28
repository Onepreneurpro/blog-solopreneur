import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await req.json();
    const { queueId, leadEmail } = body;

    if (queueId) {
      const item = await prisma.emailSequenceQueue.findUnique({
        where: { id: queueId },
      });

      if (item) {
        const newOpenedState = !item.isOpened;
        await prisma.emailSequenceQueue.update({
          where: { id: queueId },
          data: {
            isOpened: newOpenedState,
            openedAt: newOpenedState ? new Date() : null,
          },
        });

        // Recalculate lead opened count
        if (item.leadEmail) {
          const actualOpenedCount = await prisma.emailSequenceQueue.count({
            where: { leadEmail: item.leadEmail, status: 'SENT', isOpened: true },
          });

          await prisma.lead.updateMany({
            where: { email: item.leadEmail },
            data: { openedEmailsCount: actualOpenedCount },
          });
        }
      }
    } else if (leadEmail) {
      const sentItems = await prisma.emailSequenceQueue.findMany({
        where: { leadEmail, status: 'SENT' },
      });

      for (const item of sentItems) {
        await prisma.emailSequenceQueue.update({
          where: { id: item.id },
          data: { isOpened: true, openedAt: new Date() },
        });
      }

      await prisma.lead.updateMany({
        where: { email: leadEmail },
        data: { openedEmailsCount: sentItems.length },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error toggling queue open status:', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
  }
}
