import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get('url') || '/';
  const queueId = searchParams.get('queueId');
  const email = searchParams.get('email');
  const stepId = searchParams.get('stepId');

  try {
    if (queueId) {
      const queueItem = await prisma.emailSequenceQueue.findUnique({
        where: { id: queueId },
      });

      if (queueItem) {
        const wasOpened = queueItem.isOpened;

        // Mark queue item as opened AND clicked
        await prisma.emailSequenceQueue.update({
          where: { id: queueId },
          data: {
            isOpened: true,
            isClicked: true,
            clickedAt: new Date(),
            clicksCount: { increment: 1 },
            ...(wasOpened ? {} : { openedAt: new Date() }),
          },
        });

        // Recalculate lead openedEmailsCount from queue
        if (queueItem.leadEmail) {
          const actualOpenedCount = await prisma.emailSequenceQueue.count({
            where: { leadEmail: queueItem.leadEmail, status: 'SENT', isOpened: true },
          });

          await prisma.lead.updateMany({
            where: { email: queueItem.leadEmail },
            data: {
              openedEmailsCount: actualOpenedCount,
            },
          }).catch(() => {});
        }

        // Increment sequence step clicks count
        if (queueItem.stepId) {
          await prisma.emailSequenceStep.update({
            where: { id: queueItem.stepId },
            data: {
              clicksCount: { increment: 1 },
            },
          }).catch(() => {});
        }
      }
    } else if (email) {
      await prisma.lead.updateMany({
        where: { email: email.trim().toLowerCase() },
        data: {
          openedEmailsCount: { increment: 1 },
        },
      }).catch(() => {});
    }
  } catch (error) {
    console.error('Error tracking email link click:', error);
  }

  // Redirect to target URL (302 Found)
  return NextResponse.redirect(targetUrl, 302);
}
