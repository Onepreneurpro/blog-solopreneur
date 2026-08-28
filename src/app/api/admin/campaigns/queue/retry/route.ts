import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { processPendingSequenceQueue } from '@/lib/campaign-dispatcher';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { queueId, campaignId } = body;

    if (queueId) {
      await prisma.emailSequenceQueue.update({
        where: { id: queueId },
        data: { status: 'PENDING', scheduledAt: new Date(), error: null },
      });
    } else if (campaignId) {
      await prisma.emailSequenceQueue.updateMany({
        where: { campaignId, status: 'FAILED' },
        data: { status: 'PENDING', scheduledAt: new Date(), error: null },
      });
    } else {
      // Reset all failed items
      await prisma.emailSequenceQueue.updateMany({
        where: { status: 'FAILED' },
        data: { status: 'PENDING', scheduledAt: new Date(), error: null },
      });
    }

    const result = await processPendingSequenceQueue();
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Error retrying queue items:', error);
    return NextResponse.json({ error: error?.message || 'Erreur lors de la relance' }, { status: 500 });
  }
}
