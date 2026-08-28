import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const adminUser = await getCurrentUser();
    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
    }

    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'E-mail requis.' }, { status: 400 });
    }

    const lowerEmail = email.toLowerCase().trim();

    // Fetch all tickets for this customer
    const tickets = await prisma.ticket.findMany({
      where: { customerEmail: lowerEmail },
      orderBy: { createdAt: 'desc' },
      include: {
        order: { include: { items: true } },
        replies: { orderBy: { createdAt: 'asc' } },
      },
    });

    // Fetch all direct messages & marketing emails sent to this customer
    const directMessages = await prisma.directMessage.findMany({
      where: { customerEmail: lowerEmail },
      orderBy: { createdAt: 'desc' },
      include: {
        replies: { orderBy: { createdAt: 'asc' } },
      },
    });

    return NextResponse.json({
      success: true,
      email: lowerEmail,
      tickets,
      directMessages,
    });
  } catch (error: any) {
    console.error('Fetch customer history error:', error);
    return NextResponse.json({ error: error.message || 'Erreur d extraction d historique.' }, { status: 500 });
  }
}
