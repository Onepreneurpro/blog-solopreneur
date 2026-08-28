import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'EDITOR')) {
      return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
    }

    const tickets = await prisma.ticket.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        order: { include: { items: true } },
        customer: true,
        replies: { orderBy: { createdAt: 'asc' } },
      },
    });

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error('Admin tickets GET error:', error);
    return NextResponse.json({ error: 'Erreur de chargement des tickets.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'EDITOR')) {
      return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
    }

    const { action, ticketId, message, status } = await request.json();

    // 1. ADD REPLY FROM ADMIN
    if (action === 'ADD_REPLY' && ticketId && message) {
      const reply = await prisma.ticketReply.create({
        data: {
          ticketId,
          sender: 'ADMIN',
          message,
        },
      });

      await prisma.ticket.update({
        where: { id: ticketId },
        data: { status: status || 'IN_PROGRESS', updatedAt: new Date() },
      });

      return NextResponse.json({ success: true, reply });
    }

    // 2. UPDATE TICKET STATUS
    if (action === 'UPDATE_STATUS' && ticketId && status) {
      const updated = await prisma.ticket.update({
        where: { id: ticketId },
        data: { status, updatedAt: new Date() },
      });

      return NextResponse.json({ success: true, ticket: updated });
    }

    return NextResponse.json({ error: 'Action non valide.' }, { status: 400 });
  } catch (error: any) {
    console.error('Admin ticket POST error:', error);
    return NextResponse.json({ error: error.message || 'Erreur d exécution.' }, { status: 500 });
  }
}
