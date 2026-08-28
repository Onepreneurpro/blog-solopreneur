import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getActiveTheme, THEMES } from '@/lib/theme';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const activeTheme = await getActiveTheme();
    
    // Fetch hidden themes list from siteSetting
    const hiddenSetting = await prisma.siteSetting.findUnique({
      where: { key: 'hidden_themes' },
    });

    let hiddenThemes: string[] = [];
    if (hiddenSetting && hiddenSetting.value) {
      try {
        hiddenThemes = JSON.parse(hiddenSetting.value);
      } catch (e) {}
    }

    return NextResponse.json({ activeTheme, hiddenThemes, themes: THEMES });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors du chargement des thèmes.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
    }

    const body = await request.json();

    // 1. Update Active Theme
    if (body.themeId) {
      await prisma.siteSetting.upsert({
        where: { key: 'site_theme' },
        update: { value: JSON.stringify({ themeId: body.themeId }) },
        create: { key: 'site_theme', value: JSON.stringify({ themeId: body.themeId }) },
      });
      return NextResponse.json({ success: true, activeTheme: body.themeId });
    }

    // 2. Update Hidden / Deleted Themes List
    if (body.hiddenThemes !== undefined) {
      await prisma.siteSetting.upsert({
        where: { key: 'hidden_themes' },
        update: { value: JSON.stringify(body.hiddenThemes) },
        create: { key: 'hidden_themes', value: JSON.stringify(body.hiddenThemes) },
      });
      return NextResponse.json({ success: true, hiddenThemes: body.hiddenThemes });
    }

    return NextResponse.json({ error: 'Données invalides.' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors du traitement.' }, { status: 500 });
  }
}
