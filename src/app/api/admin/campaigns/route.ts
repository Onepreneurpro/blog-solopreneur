import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const campaigns = await prisma.emailCampaign.findMany({
      include: {
        smtpServer: true,
        lists: {
          include: {
            list: true,
          },
        },
        sequences: {
          where: { parentId: null },
          include: {
            variants: {
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { stepOrder: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const campaignsWithDiagnostics = await Promise.all(
      campaigns.map(async (camp) => {
        const queueStats = await prisma.emailSequenceQueue.groupBy({
          by: ['status'],
          where: { campaignId: camp.id },
          _count: { _all: true },
        });

        let totalQueued = 0;
        let pendingCount = 0;
        let sentCount = 0;
        let failedCount = 0;

        queueStats.forEach((stat) => {
          const count = stat._count._all;
          totalQueued += count;
          if (stat.status === 'PENDING') pendingCount = count;
          if (stat.status === 'SENT') sentCount = count;
          if (stat.status === 'FAILED') failedCount = count;
        });

        const lastFailedItem = failedCount > 0
          ? await prisma.emailSequenceQueue.findFirst({
              where: { campaignId: camp.id, status: 'FAILED' },
              orderBy: { updatedAt: 'desc' },
              select: { error: true, updatedAt: true },
            })
          : null;

        const nextScheduledItem = pendingCount > 0
          ? await prisma.emailSequenceQueue.findFirst({
              where: { campaignId: camp.id, status: 'PENDING' },
              orderBy: { scheduledAt: 'asc' },
              select: { scheduledAt: true },
            })
          : null;

        return {
          ...camp,
          diagnostics: {
            totalQueued,
            pendingCount,
            sentCount,
            failedCount,
            isSmtpBlocked: failedCount > 0,
            lastSmtpError: lastFailedItem?.error || null,
            lastFailedAt: lastFailedItem?.updatedAt || null,
            nextScheduledAt: nextScheduledItem?.scheduledAt || null,
          },
        };
      })
    );

    const pendingQueueCount = await prisma.emailSequenceQueue.count({
      where: { status: 'PENDING' },
    });

    const queueItems = await prisma.emailSequenceQueue.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        step: true,
        campaign: true,
      },
    });

    return NextResponse.json({ campaigns: campaignsWithDiagnostics, pendingQueueCount, queueItems });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des campagnes' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, status, smtpServerId, listIds } = body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ error: 'Le nom de la campagne est obligatoire' }, { status: 400 });
    }

    const newCampaign = await prisma.emailCampaign.create({
      data: {
        name: name.trim(),
        description: description ? description.trim() : null,
        status: status || 'ACTIVE',
        smtpServerId: smtpServerId || null,
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
        sequences: true,
      },
    });

    return NextResponse.json({ success: true, campaign: newCampaign });
  } catch (error) {
    console.error('Error creating email campaign:', error);
    return NextResponse.json({ error: 'Erreur lors de la création de la campagne' }, { status: 500 });
  }
}
