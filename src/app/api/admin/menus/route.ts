import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const DEFAULT_MENUS = [
  {
    location: 'HEADER',
    title: 'Menu Principal',
    items: [
      { title: 'Accueil', url: '/', order: 1 },
      { title: 'Blog', url: '/blog', order: 2 },
      { title: 'Ressources', url: '/ressources', order: 3 },
      { title: 'Boutique', url: '/boutique', order: 4 },
    ],
  },
  {
    location: 'FOOTER_1',
    title: 'Footer 1: Navigation',
    items: [
      { title: 'Accueil', url: '/', order: 1 },
      { title: 'Blog & Articles', url: '/blog', order: 2 },
      { title: 'Ressources Gratuites', url: '/ressources', order: 3 },
      { title: 'Boutique Digitale', url: '/boutique', order: 4 },
    ],
  },
  {
    location: 'FOOTER_2',
    title: 'Footer 2: Catégories',
    items: [
      { title: 'Freelance', url: '/blog/categorie/freelance', order: 1 },
      { title: 'Productivité', url: '/blog/categorie/productivite', order: 2 },
      { title: 'Finance & Trésorerie', url: '/blog/categorie/finance', order: 3 },
      { title: 'Templates Notion', url: '/boutique?category=notion', order: 4 },
      { title: 'Dashboards Excel', url: '/boutique?category=excel', order: 5 },
    ],
  },
  {
    location: 'FOOTER_3',
    title: 'Footer 3: Informations',
    items: [
      { title: 'À propos', url: '/a-propos', order: 1 },
      { title: 'Contact', url: '/contact', order: 2 },
      { title: 'Foire aux questions', url: '/faq', order: 3 },
      { title: 'Mentions Légales', url: '/mentions-legales', order: 4 },
      { title: 'CGV', url: '/cgv', order: 5 },
    ],
  },
];

export async function GET() {
  try {
    // Delete ONLY redundant obsolete locations: FOOTER and RESSOURCES
    await prisma.menu.deleteMany({
      where: {
        location: {
          in: ['FOOTER', 'RESSOURCES'],
        },
      },
    });

    let menus = await prisma.menu.findMany({
      include: {
        items: { orderBy: { order: 'asc' } },
      },
    });

    // Seed default HEADER, FOOTER_1, FOOTER_2, FOOTER_3 if any are missing
    for (const defMenu of DEFAULT_MENUS) {
      const exists = menus.find((m) => m.location === defMenu.location);
      if (!exists) {
        const createdMenu = await prisma.menu.create({
          data: {
            title: defMenu.title,
            location: defMenu.location,
            items: {
              create: defMenu.items,
            },
          },
          include: { items: { orderBy: { order: 'asc' } } },
        });
        menus.push(createdMenu);
      }
    }

    return NextResponse.json({ menus });
  } catch (error) {
    console.error('Menus GET error:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des menus.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
    }

    const { menuId, title, url, parentId, order } = await request.json();
    if (!menuId || !title || !url) {
      return NextResponse.json({ error: 'Titre, URL et menu requis.' }, { status: 400 });
    }

    const newItem = await prisma.menuItem.create({
      data: {
        menuId,
        title,
        url,
        parentId: parentId && parentId !== 'none' ? parentId : null,
        order: order || 0,
      },
    });

    return NextResponse.json({ success: true, item: newItem });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de l ajout de l élément.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
    }

    const body = await request.json();
    const { action, menuId, menuTitle, id, title, url, parentId, order } = body;

    // 1. ACTION: RENAME MENU TITLE (e.g. rename "Footer 3: Informations" to "Apropos")
    if (action === 'UPDATE_MENU_TITLE' && menuId && menuTitle) {
      const updatedMenu = await prisma.menu.update({
        where: { id: menuId },
        data: { title: menuTitle },
      });
      return NextResponse.json({ success: true, menu: updatedMenu });
    }

    // 2. ACTION: UPDATE MENU ITEM
    if (!id) return NextResponse.json({ error: 'ID requis.' }, { status: 400 });

    const updatedItem = await prisma.menuItem.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(url && { url }),
        parentId: parentId !== undefined ? (parentId === 'none' || !parentId ? null : parentId) : undefined,
        ...(order !== undefined && { order: Number(order) }),
      },
    });

    return NextResponse.json({ success: true, item: updatedItem });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erreur lors de la mise à jour.' }, { status: 500 });
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

    await prisma.menuItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la suppression.' }, { status: 500 });
  }
}
