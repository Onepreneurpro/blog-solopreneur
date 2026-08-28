import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Adresse email invalide' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Cancel all PENDING sequence emails for this lead
    await prisma.emailSequenceQueue.updateMany({
      where: {
        leadEmail: normalizedEmail,
        status: 'PENDING',
      },
      data: {
        status: 'CANCELLED',
      },
    });

    // 2. Mark lead status as UNSUBSCRIBED
    await prisma.lead.updateMany({
      where: { email: normalizedEmail },
      data: { status: 'UNSUBSCRIBED' },
    });

    return NextResponse.json({
      success: true,
      message: 'Vous avez été désabonné(e) de cette séquence d emails avec succès.',
    });
  } catch (error: any) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json({ error: error?.message || 'Erreur lors du désabonnement' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email requis' }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();

  await prisma.emailSequenceQueue.updateMany({
    where: {
      leadEmail: normalizedEmail,
      status: 'PENDING',
    },
    data: {
      status: 'CANCELLED',
    },
  });

  return NextResponse.json({
    success: true,
    message: 'Désabonné avec succès',
  });
}
