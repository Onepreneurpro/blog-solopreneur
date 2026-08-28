import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
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

  // Store Hero Settings
  storeHeroBadge: 'BOUTIQUE PRO POUR SOLOPRENEURS & FREELANCES',
  storeHeroTitle: 'Templates Notion & Dashboards Excel',
  storeHeroTitleAccent: 'Haute Performance',
  storeHeroSubtitle: 'Automatisez votre organisation, suivez vos finances et développez votre activité d indépendant avec des systèmes testés et prêts à l emploi.',

  storeHeroFontGlobal: true,
  storeHeroFontFamily: 'Plus Jakarta Sans',
  storeHeroBadgeFont: 'Plus Jakarta Sans',
  storeHeroBadgeSize: '11px',
  storeHeroBadgeColor: '#a3e635',
  storeHeroTitleFont: 'Plus Jakarta Sans',
  storeHeroTitleSize: '48px',
  storeHeroTitleColor: '#ffffff',
  storeHeroAccentFont: 'Plus Jakarta Sans',
  storeHeroAccentColor: '#a3e635',
  storeHeroSubtitleFont: 'Plus Jakarta Sans',
  storeHeroSubtitleSize: '16px',
  storeHeroSubtitleColor: '#cbd5e1',
  storeHeroAlign: 'center',

  // Homepage Hero Settings
  homeHeroFontGlobal: true,
  homeHeroFontFamily: 'Plus Jakarta Sans',
  homeHeroBadgeFont: 'Plus Jakarta Sans',
  homeHeroBadgeSize: '12px',
  homeHeroBadgeColor: '#a3e635',
  homeHeroTitleFont: 'Plus Jakarta Sans',
  homeHeroTitleSize: '48px',
  homeHeroTitleColor: '#ffffff',
  homeHeroAccentFont: 'Plus Jakarta Sans',
  homeHeroAccentColor: '#a3e635',
  homeHeroSubtitleFont: 'Plus Jakarta Sans',
  homeHeroSubtitleSize: '18px',
  homeHeroSubtitleColor: '#cbd5e1',
  homeHeroAlign: 'center',
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
      where: { key: 'general_settings', value: JSON.stringify(mergedValues) },
      update: { value: JSON.stringify(mergedValues) },
      create: { key: 'general_settings', value: JSON.stringify(mergedValues) },
    });

    try {
      revalidatePath('/');
      revalidatePath('/boutique');
      revalidatePath('/admin/homepage');
      revalidatePath('/admin/categories-produits');
    } catch (e) {}

    return NextResponse.json({ success: true, settings: mergedValues });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erreur d enregistrement.' }, { status: 500 });
  }
}
