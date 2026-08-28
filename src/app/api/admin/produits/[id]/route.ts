import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: { category: true },
    });

    if (!product) {
      return NextResponse.json({ error: 'Produit introuvable.' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur de récupération.' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
      coverImage,
      price,
      compareAtPrice,
      productCategoryId,
      fileType,
      fileUrl,
      isFreeResource,
      isFeatured,
      status,
    } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Nom et slug requis.' }, { status: 400 });
    }

    const updated = await prisma.product.update({
      where: { id: params.id },
      data: {
        name,
        slug,
        shortDescription: shortDescription || null,
        longDescription: longDescription || '',
        coverImage: coverImage || null,
        price: Number(price),
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
        categoryId: productCategoryId || null,
        productCategoryId: productCategoryId || null,
        ...(fileType ? { fileType } : {}),
        fileUrl: fileUrl || null,
        isFreeResource: Boolean(isFreeResource),
        isFeatured: Boolean(isFeatured),
        status: status || 'PUBLISHED',
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erreur de mise à jour.' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
    }

    await prisma.product.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la suppression.' }, { status: 500 });
  }
}
