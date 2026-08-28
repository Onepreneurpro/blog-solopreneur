import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// 1x1 transparent GIF pixel Buffer
const TRANSPARENT_GIF_PIXEL = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

function sanitizeParam(val: string | null): string | null {
  if (!val) return null;
  let clean = val.trim();
  clean = clean.replace(/^(=?3D|%3D)/i, '');
  clean = clean.replace(/(=|%20|\s)+/g, '');
  return clean || null;
}

function sanitizeEmail(val: string | null): string | null {
  if (!val) return null;
  let clean = val.trim().toLowerCase();
  clean = clean.replace(/^(=?3D|%3D)/i, '');
  clean = clean.replace(/(=|\s)+/g, '');
  return clean || null;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawQueueId = searchParams.get('queueId');
    const rawEmail = searchParams.get('email');

    const queueId = sanitizeParam(rawQueueId);
    const email = sanitizeEmail(rawEmail);

    let queueItem = null;

    if (queueId) {
      queueItem = await prisma.emailSequenceQueue.findUnique({
        where: { id: queueId },
      }).catch(() => null);
    }

    if (!queueItem && email) {
      queueItem = await prisma.emailSequenceQueue.findFirst({
        where: { leadEmail: email, status: 'SENT', isOpened: false },
        orderBy: { sentAt: 'desc' },
      });
    }

    if (queueItem) {
      if (!queueItem.isOpened) {
        await prisma.emailSequenceQueue.update({
          where: { id: queueItem.id },
          data: {
            isOpened: true,
            openedAt: new Date(),
          },
        });
      }

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
    } else if (email) {
      await prisma.lead.updateMany({
        where: { email },
        data: {
          openedEmailsCount: { increment: 1 },
        },
      }).catch(() => {});
    }
  } catch (error) {
    console.error('Error tracking email open pixel:', error);
  }

  // Return 1x1 transparent GIF with no-cache headers
  return new NextResponse(TRANSPARENT_GIF_PIXEL, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}
