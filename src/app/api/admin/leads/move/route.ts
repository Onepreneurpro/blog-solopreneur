import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await req.json();
    const { leadIds, targetListId } = body;

    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json({ error: 'Aucun lead sélectionné' }, { status: 400 });
    }

    // Update target list ID for selected leads
    await prisma.lead.updateMany({
      where: {
        id: { in: leadIds },
      },
      data: {
        listId: targetListId === 'NONE' || !targetListId ? null : targetListId,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `${leadIds.length} lead(s) déplacé(s) avec succès !`,
    });
  } catch (error) {
    console.error('Error moving leads:', error);
    return NextResponse.json({ error: 'Erreur lors du déplacement des leads' }, { status: 500 });
  }
}
