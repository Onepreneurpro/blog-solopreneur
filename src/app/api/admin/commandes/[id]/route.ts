import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const adminUser = await getCurrentUser();
    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
    }

    const orderId = params.id;

    // Search by UUID or orderNumber
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: orderId }, { orderNumber: orderId }],
      },
      include: {
        customer: true,
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
        downloads: true,
        tickets: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Commande introuvable.' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    console.error('Order GET error:', error);
    return NextResponse.json({ error: 'Erreur lors du chargement de la commande.' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const adminUser = await getCurrentUser();
    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
    }

    const orderId = params.id;
    const body = await request.json();
    const { status, addStoreCredit } = body;

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: orderId }, { orderNumber: orderId }],
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Commande introuvable.' }, { status: 404 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: status || order.status,
      },
    });

    // If refund & addStoreCredit flag is requested
    if (status === 'REFUNDED' && addStoreCredit) {
      const user = await prisma.user.findUnique({
        where: { email: order.customerEmail.toLowerCase() },
      });

      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            storeCredit: { increment: order.totalAmount },
          },
        });
      }
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    console.error('Order PATCH error:', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour de la commande.' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const adminUser = await getCurrentUser();
    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
    }

    const orderId = params.id;

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: orderId }, { orderNumber: orderId }],
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Commande introuvable.' }, { status: 404 });
    }

    await prisma.orderItem.deleteMany({
      where: { orderId: order.id },
    });

    await prisma.order.delete({
      where: { id: order.id },
    });

    return NextResponse.json({ success: true, message: 'Commande supprimée avec succès.' });
  } catch (error: any) {
    console.error('Order DELETE error:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression de la commande.' }, { status: 500 });
  }
}
