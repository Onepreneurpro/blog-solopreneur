import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        status: 'PUBLISHED',
      },
      orderBy: { isFeatured: 'desc' },
      include: {
        category: { select: { name: true, slug: true } },
      },
      take: 12,
    });

    return NextResponse.json({ products });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erreur d extraction des produits.' }, { status: 500 });
  }
}
