import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(
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
    const { name, description, status, smtpServerId, listIds } = body;

    // Delete existing list links if listIds array is explicitly provided
    if (Array.isArray(listIds)) {
      await prisma.campaignLeadList.deleteMany({
        where: { campaignId: id },
      });
    }

    const existingCampaign = await prisma.emailCampaign.findUnique({ where: { id } });

    let pausedAtValue: Date | null | undefined = undefined;

    if (existingCampaign && status) {
      if (existingCampaign.status !== 'PAUSED' && status === 'PAUSED') {
        pausedAtValue = new Date();
      } else if (existingCampaign.status === 'PAUSED' && status === 'ACTIVE') {
        if (existingCampaign.pausedAt) {
          const pauseDurationMs = Date.now() - existingCampaign.pausedAt.getTime();
          if (pauseDurationMs > 0) {
            const pendingQueueItems = await prisma.emailSequenceQueue.findMany({
              where: { campaignId: id, status: 'PENDING' },
            });

            for (const item of pendingQueueItems) {
              const shiftedScheduledAt = new Date(item.scheduledAt.getTime() + pauseDurationMs);
              await prisma.emailSequenceQueue.update({
                where: { id: item.id },
                data: { scheduledAt: shiftedScheduledAt },
              });
            }
          }
        }
        pausedAtValue = null;
      }
    }

    const updated = await prisma.emailCampaign.update({
      where: { id },
      data: {
        name: name ? name.trim() : undefined,
        description: description !== undefined ? (description ? description.trim() : null) : undefined,
        status: status || undefined,
        smtpServerId: smtpServerId !== undefined ? (smtpServerId || null) : undefined,
        pausedAt: pausedAtValue,
        updatedAt: new Date(),
        lists: Array.isArray(listIds) && listIds.length > 0 ? {
          create: listIds.map((lId: string) => ({
            list: { connect: { id: lId } },
          })),
        } : undefined,
      },
      include: {
        smtpServer: true,
        lists: {
          include: {
            list: true,
          },
        },
        sequences: {
          orderBy: { stepOrder: 'asc' },
        },
      },
    });

    return NextResponse.json({ success: true, campaign: updated });
  } catch (error) {
    console.error('Error updating campaign:', error);
    return NextResponse.json({ error: 'Erreur lors de la modification de la campagne' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = params;
    await prisma.emailCampaign.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Campagne supprimée avec succès' });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression de la campagne' }, { status: 500 });
  }
}
