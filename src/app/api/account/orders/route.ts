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

    const lowerEmail = user.email.toLowerCase().trim();

    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { customerEmail: lowerEmail },
          { customerId: user.id },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { product: true } },
        downloads: true,
      },
    });

    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    console.error('Account orders GET error:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération de vos commandes.' }, { status: 500 });
  }
}
