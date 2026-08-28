import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const DEFAULT_PRODUCT_CATEGORIES = [
  {
    name: 'Templates Notion',
    slug: 'notion',
    description: 'Workspaces Notion avancés, CRM et tableaux de gestion',
  },
  {
    name: 'Dashboards Excel',
    slug: 'excel',
    description: 'Tableaux de bord Excel de trésorerie, facturation et rentabilité',
  },
  {
    name: 'Ressources & Guides',
    slug: 'ressources',
    description: 'Guides pratiques, e-books et ressources téléchargeables',
  },
];

export async function GET() {
  try {
    let dbCategories = await prisma.productCategory.findMany({
      orderBy: { createdAt: 'asc' },
    });

    // Seed default categories ONLY if table is completely empty
    if (dbCategories.length === 0) {
      for (const defCat of DEFAULT_PRODUCT_CATEGORIES) {
        await prisma.productCategory.create({
          data: defCat,
        });
      }

      dbCategories = await prisma.productCategory.findMany({
        orderBy: { createdAt: 'asc' },
      });
    }

    // Ensure 'ressources' category exists
    const hasRessources = dbCategories.some((c) => c.slug === 'ressources');
    if (!hasRessources) {
      const resCat = await prisma.productCategory.create({
        data: {
          name: 'Ressources & Guides',
          slug: 'ressources',
          description: 'Guides pratiques, e-books et ressources téléchargeables',
        },
      });
      dbCategories.push(resCat);
    }

    // Compute products count dynamically
    const categoriesWithCount = await Promise.all(
      dbCategories.map(async (cat) => {
        const count = await prisma.product.count({
          where: { productCategoryId: cat.id },
        });

        return {
          ...cat,
          _count: { products: count },
        };
      })
    );

    return NextResponse.json({ categories: categoriesWithCount });
  } catch (error) {
    console.error('GET categories-produits error:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des catégories.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
    }

    const { name, slug, description } = await request.json();

    if (!name || !slug) {
      return NextResponse.json({ error: 'Nom et slug requis.' }, { status: 400 });
    }

    const category = await prisma.productCategory.create({
      data: {
        name,
        slug,
        description,
      },
    });

    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    console.error('POST category-produit error:', error);
    return NextResponse.json({ error: error.message || 'Erreur de création.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
    }

    const { id, name, slug, description } = await request.json();

    if (!id || !name || !slug) {
      return NextResponse.json({ error: 'ID, Nom et slug requis.' }, { status: 400 });
    }

    const category = await prisma.productCategory.update({
      where: { id },
      data: {
        name,
        slug,
        description,
      },
    });

    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erreur de modification.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID requis.' }, { status: 400 });

    await prisma.productCategory.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erreur de suppression.' }, { status: 500 });
  }
}
