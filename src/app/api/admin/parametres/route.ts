import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: 'general_settings' },
    });

    const settingsData = setting ? JSON.parse(setting.value) : {
      siteTitle: 'Solopreneur&Co',
      tagline: 'Plateforme & Ressources pour Freelances et Indépendants',
      contactEmail: 'contact@solopreneur.io',
      adminEmail: 'admin@solopreneur.io',
      currency: 'EUR (€)',
      activeTheme: 'makers-purple',
      bannerTickerText: 'Nouveau : Formations & Templates IA pour Solopreneurs 2026',
      bannerTickerLink: '/boutique',
      footerCopyright: '© 2026 Solopreneur&Co. Tous droits réservés.',
    };

    return NextResponse.json({ settings: settingsData });
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
      where: { key: 'general_settings' },
      update: { value: JSON.stringify(body) },
      create: { key: 'general_settings', value: JSON.stringify(body) },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erreur d enregistrement.' }, { status: 500 });
  }
}
