import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { isFreeResource: false },
      orderBy: { createdAt: 'desc' },
      include: { category: true, targetList: true, welcomeStep: true },
    });

    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la récupération.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      slug,
      shortDescription,
      longDescription,
      price,
      compareAtPrice,
      coverImage,
      icon,
      productCategoryId,
      fileType,
      fileUrl,
      isFreeResource,
      isFeatured,
      status,
      targetListId,
      welcomeStepId,
    } = body;

    if (!name || !slug || price === undefined) {
      return NextResponse.json({ error: 'Nom, slug et prix sont obligatoires.' }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        shortDescription: shortDescription || null,
        longDescription: longDescription || '',
        price: Number(price),
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
        coverImage: coverImage || null,
        icon: icon || null,
        categoryId: productCategoryId || null,
        productCategoryId: productCategoryId || null,
        fileType: fileType || 'ZIP',
        fileUrl: fileUrl || null,
        isFreeResource: Boolean(isFreeResource),
        isFeatured: Boolean(isFeatured),
        status: status || 'PUBLISHED',
        targetListId: targetListId || null,
        welcomeStepId: welcomeStepId || null,
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: error.message || 'Erreur lors de la création.' }, { status: 500 });
  }
}
