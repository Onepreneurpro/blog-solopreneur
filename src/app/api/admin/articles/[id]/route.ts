import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const article = await prisma.article.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    });

    if (!article) {
      return NextResponse.json({ error: 'Article introuvable.' }, { status: 404 });
    }

    return NextResponse.json({ article });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la récupération.' }, { status: 500 });
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
    const { title, slug, excerpt, content, coverImage, categoryId, status, readingTime } = body;

    if (!title || !slug || !content) {
      return NextResponse.json({ error: 'Titre, slug et contenu sont obligatoires.' }, { status: 400 });
    }

    const updated = await prisma.article.update({
      where: { id: params.id },
      data: {
        title,
        slug,
        excerpt: excerpt || null,
        content,
        coverImage: coverImage || null,
        categoryId: categoryId || null,
        status: status || 'PUBLISHED',
        readingTime: readingTime ? Number(readingTime) : 5,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, article: updated });
  } catch (error: any) {
    console.error('Update article error:', error);
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

    await prisma.article.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur de suppression.' }, { status: 500 });
  }
}
