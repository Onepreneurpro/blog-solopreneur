import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pages = await prisma.page.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ pages });
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

    const { title, slug, content, coverImage, targetMenu, status, seoTitle, seoDescription } = await request.json();

    if (!title || !slug) {
      return NextResponse.json({ error: 'Titre et slug requis.' }, { status: 400 });
    }

    const page = await prisma.page.create({
      data: {
        title,
        slug,
        content: content || '',
        coverImage: coverImage || null,
        targetMenu: targetMenu || 'NONE',
        status: status || 'PUBLISHED',
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
      },
    });

    // Automatically add menu item if a target menu was chosen!
    if (targetMenu && targetMenu !== 'NONE') {
      try {
        let menu = await prisma.menu.findFirst({ where: { location: targetMenu } });
        if (!menu) {
          menu = await prisma.menu.create({
            data: {
              title: targetMenu === 'HEADER' ? 'En-tête Principal' : targetMenu === 'FOOTER' ? 'Bas de Page' : 'Menu Ressources',
              location: targetMenu,
            },
          });
        }

        await prisma.menuItem.create({
          data: {
            menuId: menu.id,
            title: title,
            url: `/${slug}`,
            type: 'PAGE',
          },
        });
      } catch (menuErr) {
        console.error('Menu item link error:', menuErr);
      }
    }

    return NextResponse.json({ success: true, page });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erreur lors de la création.' }, { status: 500 });
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

    await prisma.page.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la suppression.' }, { status: 500 });
  }
}
