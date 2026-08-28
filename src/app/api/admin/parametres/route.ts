import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const DEFAULT_SETTINGS = {
  siteTitle: 'Solopreneur&Co',
  tagline: 'Plateforme & Ressources pour Freelances et Indépendants',
  contactEmail: 'contact@solopreneur.io',
  adminEmail: 'admin@solopreneur.io',
  currency: 'EUR (€)',
  activeTheme: 'makers-purple',
  bannerTickerText: 'Nouveau : Formations & Templates IA pour Solopreneurs 2026',
  bannerTickerLink: '/boutique',
  footerCopyright: '© 2026 Solopreneur&Co. Tous droits réservés.',
  storeHeroBadge: 'BOUTIQUE PRO POUR SOLOPRENEURS & FREELANCES',
  storeHeroTitle: 'Templates Notion & Dashboards Excel',
  storeHeroTitleAccent: 'Haute Performance',
  storeHeroSubtitle: 'Automatisez votre organisation, suivez vos finances et développez votre activité d indépendant avec des systèmes testés et prêts à l emploi.',
  storeHeroFontFamily: 'Plus Jakarta Sans',
  storeHeroTitleSize: 'large',
  storeHeroSubtitleSize: 'normal',
  storeHeroBadgeStyle: 'green',
  storeHeroAlign: 'center',
};

export async function GET() {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: 'general_settings' },
    });

    const settingsData = setting
      ? { ...DEFAULT_SETTINGS, ...JSON.parse(setting.value) }
      : DEFAULT_SETTINGS;

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

    const existingSetting = await prisma.siteSetting.findUnique({
      where: { key: 'general_settings' },
    });

    const currentValues = existingSetting ? JSON.parse(existingSetting.value) : DEFAULT_SETTINGS;
    const mergedValues = { ...currentValues, ...body };

    await prisma.siteSetting.upsert({
      where: { key: 'general_settings' },
      update: { value: JSON.stringify(mergedValues) },
      create: { key: 'general_settings', value: JSON.stringify(mergedValues) },
    });

    return NextResponse.json({ success: true, settings: mergedValues });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erreur d enregistrement.' }, { status: 500 });
  }
}
