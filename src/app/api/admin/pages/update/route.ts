import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
    }

    const { id, title, slug, content, coverImage, targetMenu, status, seoTitle, seoDescription } = await request.json();

    if (!id || !title || !slug) {
      return NextResponse.json({ error: 'ID, titre et slug requis.' }, { status: 400 });
    }

    const updatedPage = await prisma.page.update({
      where: { id },
      data: {
        title,
        slug,
        content: content || '',
        coverImage: coverImage || null,
        targetMenu: targetMenu || 'NONE',
        status: status || 'PUBLISHED',
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        updatedAt: new Date(),
      },
    });

    // Update or add menu link if a valid target menu was chosen!
    if (targetMenu && targetMenu !== 'NONE') {
      try {
        let menu = await prisma.menu.findFirst({ where: { location: targetMenu } });
        if (menu) {
          const existingItem = await prisma.menuItem.findFirst({
            where: { menuId: menu.id, url: `/${slug}` },
          });

          if (!existingItem) {
            await prisma.menuItem.create({
              data: {
                menuId: menu.id,
                title: title,
                url: `/${slug}`,
                type: 'PAGE',
              },
            });
          } else {
            await prisma.menuItem.update({
              where: { id: existingItem.id },
              data: { title },
            });
          }
        }
      } catch (menuErr) {
        console.error('Menu item link error:', menuErr);
      }
    }

    return NextResponse.json({ success: true, page: updatedPage });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erreur lors de la mise à jour.' }, { status: 500 });
  }
}
