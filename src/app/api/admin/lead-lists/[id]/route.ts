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
    const { name, description, color, sourceType } = body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ error: 'Le nom de la liste est obligatoire' }, { status: 400 });
    }

    const cleanName = name.trim();
    const cleanSourceType = sourceType || 'ALL';

    const updatedList = await prisma.leadList.update({
      where: { id },
      data: {
        name: cleanName,
        description: description ? description.trim() : null,
        color: color || '#a3e635',
        sourceType: cleanSourceType,
        updatedAt: new Date(),
      },
    });

    // If sourceType changed to CUSTOMERS, populate list with store buyers
    if (cleanSourceType === 'CUSTOMERS') {
      const orders = await prisma.order.findMany({
        where: { status: 'COMPLETED' },
        select: { customerEmail: true, user: { select: { name: true } } },
      });

      const uniqueBuyersMap = new Map<string, string | null>();
      for (const ord of orders) {
        if (ord.customerEmail && ord.customerEmail.includes('@')) {
          uniqueBuyersMap.set(ord.customerEmail.toLowerCase(), ord.user?.name || null);
        }
      }

      for (const [buyerEmail, buyerName] of uniqueBuyersMap.entries()) {
        await prisma.lead.upsert({
          where: { email: buyerEmail },
          update: {
            listId: updatedList.id,
            source: 'CUSTOMER',
            updatedAt: new Date(),
          },
          create: {
            email: buyerEmail,
            firstName: buyerName,
            source: 'CUSTOMER',
            listId: updatedList.id,
          },
        });
      }
    } else if (cleanSourceType === 'EBOOK_OPTIN' || cleanSourceType === 'FREE_RESOURCE' || cleanSourceType === 'NEWSLETTER') {
      await prisma.lead.updateMany({
        where: {
          source: cleanSourceType,
          listId: null,
        },
        data: {
          listId: updatedList.id,
          updatedAt: new Date(),
        },
      });
    }

    return NextResponse.json({ success: true, list: updatedList });
  } catch (error) {
    console.error('Error updating lead list:', error);
    return NextResponse.json({ error: 'Erreur lors de la modification de la liste' }, { status: 500 });
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

    // Reset listId on leads assigned to this list before deleting the list
    await prisma.lead.updateMany({
      where: { listId: id },
      data: { listId: null },
    });

    await prisma.leadList.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Liste supprimée avec succès' });
  } catch (error) {
    console.error('Error deleting lead list:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression de la liste' }, { status: 500 });
  }
}
