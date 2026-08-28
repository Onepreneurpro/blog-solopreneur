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
    const { status, listId, firstName, lastName } = body;

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(listId !== undefined ? { listId } : {}),
        ...(firstName !== undefined ? { firstName } : {}),
        ...(lastName !== undefined ? { lastName } : {}),
        updatedAt: new Date(),
      },
      include: { list: true },
    });

    return NextResponse.json({ success: true, lead: updatedLead });
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour du lead' }, { status: 500 });
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
    const targetLead = await prisma.lead.findUnique({ where: { id } });
    if (targetLead) {
      await prisma.emailSequenceQueue.deleteMany({
        where: { leadEmail: targetLead.email },
      });
      await prisma.lead.delete({
        where: { id },
      });
    }

    return NextResponse.json({ success: true, message: 'Lead supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression du lead' }, { status: 500 });
  }
}
