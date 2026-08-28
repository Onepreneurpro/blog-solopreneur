import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const medias = await prisma.media.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ medias });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors du chargement des médias.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
    }

    const contentType = request.headers.get('content-type') || '';

    // MULTIPART FORM DATA FILE UPLOAD (.xlsx, .pdf, .zip, avatar images)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ error: 'Aucun fichier fourni.' }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

      // Ensure directory exists
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const safeFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = path.join(uploadsDir, safeFilename);

      await fs.promises.writeFile(filePath, buffer);

      const fileUrl = `/uploads/${safeFilename}`;

      const media = await prisma.media.create({
        data: {
          filename: safeFilename,
          originalName: file.name,
          mimeType: file.type || 'application/octet-stream',
          size: file.size,
          url: fileUrl,
          title: file.name,
        },
      });

      return NextResponse.json({ success: true, media });
    }

    // JSON PAYLOAD (URL PASTE)
    const { url, title, altText } = await request.json();
    if (!url) {
      return NextResponse.json({ error: 'URL requise.' }, { status: 400 });
    }

    const media = await prisma.media.create({
      data: {
        filename: title || 'Fichier',
        originalName: title || 'Fichier',
        mimeType: 'application/octet-stream',
        size: 1024,
        url,
        altText: altText || title || null,
        title: title || null,
      },
    });

    return NextResponse.json({ success: true, media });
  } catch (error: any) {
    console.error('Media upload error:', error);
    return NextResponse.json({ error: error.message || 'Erreur lors du téléversement.' }, { status: 500 });
  }
}
