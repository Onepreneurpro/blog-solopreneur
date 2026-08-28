import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const resources = await prisma.product.findMany({
      where: {
        isFreeResource: true,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
      },
    });

    return NextResponse.json({ resources });
  } catch (error) {
    console.error('GET admin ressources error:', error);
    return NextResponse.json({ error: 'Erreur de récupération.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
    }

    const body = await request.json();
    const { name, slug, shortDescription, longDescription, coverImage, images, fileUrl } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Nom et slug requis.' }, { status: 400 });
    }

    const imagesList = Array.isArray(images) ? images : (typeof images === 'string' && images ? [images] : []);
    const imagesJson = imagesList.length > 0 ? JSON.stringify(imagesList) : null;
    const primaryCover = coverImage || (imagesList.length > 0 ? imagesList[0] : null);

    const resource = await prisma.product.create({
      data: {
        name,
        slug,
        shortDescription: shortDescription || null,
        longDescription: longDescription || '',
        coverImage: primaryCover,
        images: imagesJson,
        fileUrl: fileUrl || null,
        price: 0,
        compareAtPrice: null,
        isFreeResource: true,
        isFeatured: false,
        status: 'PUBLISHED',
        productCategoryId: null,
      },
    });

    return NextResponse.json({ success: true, resource });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erreur lors de la création.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, slug, shortDescription, longDescription, coverImage, images, fileUrl } = body;

    if (!id || !name || !slug) {
      return NextResponse.json({ error: 'ID, nom et slug requis.' }, { status: 400 });
    }

    const imagesList = Array.isArray(images) ? images : (typeof images === 'string' && images ? [images] : []);
    const imagesJson = imagesList.length > 0 ? JSON.stringify(imagesList) : null;
    const primaryCover = coverImage || (imagesList.length > 0 ? imagesList[0] : null);

    const updatedResource = await prisma.product.update({
      where: { id },
      data: {
        name,
        slug,
        shortDescription: shortDescription || null,
        longDescription: longDescription || '',
        coverImage: primaryCover,
        images: imagesJson,
        fileUrl: fileUrl || null,
        price: 0,
        isFreeResource: true,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, resource: updatedResource });
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

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la suppression.' }, { status: 500 });
  }
}
