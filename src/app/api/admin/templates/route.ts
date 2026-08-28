import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const templates = await prisma.product.findMany({
      where: {
        OR: [
          { category: { slug: { in: ['notion', 'excel'] } } },
          { name: { contains: 'Template' } },
          { name: { contains: 'Dashboard' } },
          { name: { contains: 'Notion' } },
          { name: { contains: 'Excel' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
      },
    });
    return NextResponse.json({ templates });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la récupération des templates.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
    }

    const body = await request.json();
    const { name, slug, templateType, shortDescription, longDescription, price, compareAtPrice, coverImage, fileUrl, isFeatured, status } = body;

    if (!name || !slug || price === undefined) {
      return NextResponse.json({ error: 'Nom, slug et prix obligatoires.' }, { status: 400 });
    }

    // Find or create category for templateType (notion vs excel)
    let category = await prisma.productCategory.findUnique({
      where: { slug: templateType || 'notion' },
    });

    if (!category) {
      category = await prisma.productCategory.create({
        data: {
          name: templateType === 'excel' ? 'Dashboards Excel' : 'Templates Notion',
          slug: templateType || 'notion',
        },
      });
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
        fileUrl: fileUrl || null,
        productCategoryId: category.id,
        isFeatured: Boolean(isFeatured),
        status: status || 'PUBLISHED',
      },
    });

    return NextResponse.json({ success: true, template: product });
  } catch (error: any) {
    console.error('Create template error:', error);
    return NextResponse.json({ error: error.message || 'Erreur lors de la création du template.' }, { status: 500 });
  }
}
