import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: 'seo_settings' },
    });
    const seoData = setting ? JSON.parse(setting.value) : {
      siteName: 'Solopreneur & Co',
      metaTitle: 'Solopreneur & Co - Plateforme & Ressources pour Freelances et Indépendants',
      metaDescription: 'La plateforme de référence pour les freelances, solopreneurs et indépendants. Templates Notion, tableaux Excel, guides et ressources.',
      ogImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c',
      twitterHandle: '@solopreneur_co',
      googleAnalyticsId: 'G-XXXXXXXXXX',
      robotsTxt: 'User-agent: *\nAllow: /',
    };
    return NextResponse.json({ seo: seoData });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la récupération.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
    }

    const body = await request.json();

    await prisma.siteSetting.upsert({
      where: { key: 'seo_settings' },
      update: { value: JSON.stringify(body) },
      create: { key: 'seo_settings', value: JSON.stringify(body) },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erreur d enregistrement.' }, { status: 500 });
  }
}
