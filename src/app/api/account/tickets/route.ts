import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
    }

    const tickets = await prisma.ticket.findMany({
      where: { customerEmail: user.email.toLowerCase() },
      orderBy: { createdAt: 'desc' },
      include: {
        order: { include: { items: true } },
        replies: { orderBy: { createdAt: 'asc' } },
      },
    });

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error('Customer tickets GET error:', error);
    return NextResponse.json({ error: 'Erreur lors du chargement des tickets.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
    }

    const { action, ticketId, subject, message, replyMessage, priority, orderId } = await request.json();

    // 1. CREATE TICKET
    if ((action === 'CREATE_TICKET' || (!action && subject)) && subject && message) {
      const ticketNumber = `TCK-${Date.now().toString().slice(-6)}`;
      const newTicket = await prisma.ticket.create({
        data: {
          ticketNumber,
          subject,
          message,
          orderId: orderId || null,
          customerEmail: user.email.toLowerCase(),
          customerId: user.id,
          priority: priority || 'MEDIUM',
          status: 'OPEN',
        },
      });

      return NextResponse.json({ success: true, ticket: newTicket });
    }

    // 2. REPLY TO TICKET
    if ((action === 'ADD_REPLY' || action === 'REPLY' || (!action && replyMessage)) && ticketId && replyMessage) {
      const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
      if (!ticket || ticket.customerEmail.toLowerCase() !== user.email.toLowerCase()) {
        return NextResponse.json({ error: 'Ticket introuvable.' }, { status: 404 });
      }

      const reply = await prisma.ticketReply.create({
        data: {
          ticketId,
          sender: 'CUSTOMER',
          message: replyMessage,
        },
      });

      await prisma.ticket.update({
        where: { id: ticketId },
        data: { status: 'OPEN', updatedAt: new Date() },
      });

      return NextResponse.json({ success: true, reply });
    }

    // 3. CLOSE / RESOLVE TICKET BY CUSTOMER
    if ((action === 'CLOSE_TICKET' || action === 'RESOLVE_TICKET') && ticketId) {
      const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
      if (!ticket || ticket.customerEmail.toLowerCase() !== user.email.toLowerCase()) {
        return NextResponse.json({ error: 'Ticket introuvable.' }, { status: 404 });
      }

      await prisma.ticket.update({
        where: { id: ticketId },
        data: { status: 'RESOLVED', updatedAt: new Date() },
      });

      return NextResponse.json({ success: true, message: 'Ticket fermé et marqué comme résolu.' });
    }

    return NextResponse.json({ error: 'Action non reconnue.' }, { status: 400 });
  } catch (error: any) {
    console.error('Customer ticket POST error:', error);
    return NextResponse.json({ error: error.message || 'Erreur lors de l opération.' }, { status: 500 });
  }
}
