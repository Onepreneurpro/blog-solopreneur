import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const DEFAULT_SECTIONS = [
  {
    sectionKey: 'HERO',
    title: 'Les formations & templates qui te font <mark>gagner plus</mark> en freelance.',
    subtitle: 'Des automatisations sur mesure, des templates Notion optimisés et des tableaux Excel conçus pour décupler ton chiffre d affaires.',
    isEnabled: true,
    order: 0,
    settings: JSON.stringify({
      btn1Text: 'Voir la boutique & les templates',
      btn1Url: '/boutique',
      btn1Style: 'yellow',
      btn2Text: 'Ressources Gratuites',
      btn2Url: '/ressources',
      btn2Style: 'purple',
    }),
  },
  {
    sectionKey: 'TICKER',
    title: 'Bandeau Fluo Défilant',
    subtitle: 'Accès immédiat, Boost du TJM, +5000 Solopreneurs',
    isEnabled: true,
    order: 1,
    settings: JSON.stringify({
      item1Text: 'ACCÈS IMMÉDIAT AUX TEMPLATES NOTION & EXCEL',
      item2Text: 'BOOSTE TON TJM ET TES REVENUS FREELANCE',
      item3Text: 'PLUS DE 5 000 SOLOPRENEURS ACCOMPAGNÉS',
    }),
  },
  {
    sectionKey: 'CATEGORIES',
    title: 'Explorez par objectif & besoin',
    subtitle: 'Retrouvez nos meilleurs articles, templates Notion et outillages Excel classés par objectif.',
    isEnabled: true,
    order: 2,
    settings: JSON.stringify({
      card1Title: 'Gestion Client & TJM Freelance',
      card1Badge: 'Populaire',
      card1Desc: 'Calculateurs de TJM, modèles de contrats et méthodes de négociation.',
      card1BtnText: 'Explorer les guides',
      card1Url: '/blog/categorie/freelance',
      card2Title: 'Templates Notion & Méthode PARA',
      card2Badge: 'Prêt à dupliquer',
      card2Desc: 'Workspaces complets et CRM clients pré-configurés pour votre organisation.',
      card2BtnText: 'Explorer les templates',
      card2Url: '/boutique/categorie/notion',
      card3Title: 'Trésorerie & Dashboards Excel',
      card3Badge: 'Automatisé',
      card3Desc: 'Tableaux de bord financiers pour piloter vos revenus et votre rentabilité.',
      card3BtnText: 'Voir les tableaux',
      card3Url: '/boutique/categorie/excel',
    }),
  },
  {
    sectionKey: 'PRODUCTS',
    title: 'Boutique Digitale : Nos Meilleurs Outillages & Templates',
    subtitle: 'Des systèmes prêts à l emploi pour structurer votre activité sans réinventer la roue.',
    isEnabled: true,
    order: 3,
    settings: JSON.stringify({
      btn1Text: 'Voir toute la boutique',
      btn1Url: '/boutique',
      btn1Style: 'purple',
    }),
  },
  {
    sectionKey: 'DARK_FEATURE',
    title: 'Tout ce dont vous avez besoin pour structurer et faire <mark>décoller votre activité</mark>.',
    subtitle: 'Ne perdez plus des heures à configurer des outils bancales. Accédez à nos systèmes complets.',
    isEnabled: true,
    order: 4,
    settings: JSON.stringify({
      check1: 'Workspaces Notion avancés avec CRM & Gestion de projet intégrés',
      check2: 'Dashboards Excel financiers pour piloter la trésorerie et la rentabilité',
      check3: 'Guides d accompagnement et mises à jour gratuites à vie',
      review1Score: '4.9 / 5',
      review1Quote: 'Le workspace Notion et le dashboard de trésorerie ont totalement changé ma gestion quotidienne. Je gagne plus de 5h par semaine et mes relances clients sont automatisées !',
      review1Author: 'Sophie C.',
      review1Role: 'Consultante Marketing & Freelance',
      btn1Text: 'Explorer nos outillages prêts à l emploi →',
      btn1Url: '/boutique',
      btn1Style: 'yellow',
    }),
  },
  {
    sectionKey: 'RESOURCES',
    title: 'Guides, Checklists & Modèles 100% Gratuits',
    subtitle: 'Téléchargez nos outils gratuits pour améliorer instantanément vos process.',
    isEnabled: true,
    order: 5,
    settings: JSON.stringify({
      btn1Text: 'Découvrir toutes les ressources',
      btn1Url: '/ressources',
      btn1Style: 'purple',
    }),
  },
  {
    sectionKey: 'ARTICLES',
    title: 'Conseils & Guides pour Solopreneurs',
    subtitle: 'Découvrez nos méthodes pour prospecter, s organiser et développer votre activité.',
    isEnabled: true,
    order: 6,
    settings: JSON.stringify({
      btn1Text: 'Voir tous les articles',
      btn1Url: '/blog',
      btn1Style: 'purple',
    }),
  },
  {
    sectionKey: 'TESTIMONIALS',
    title: 'Ce que disent les solopreneurs',
    subtitle: 'Rejoignez des milliers de freelances et créateurs qui font confiance à Solopreneur & Co.',
    isEnabled: true,
    order: 7,
    settings: JSON.stringify({}),
  },
  {
    sectionKey: 'FINAL_CTA',
    title: 'Prêt à décupler ton efficacité et tes revenus en freelance ?',
    subtitle: 'Accède instantanément à tous nos templates Notion, tableaux Excel automatisés et guides pratiques.',
    isEnabled: true,
    order: 8,
    settings: JSON.stringify({
      btn1Text: 'Accéder à la boutique',
      btn1Url: '/boutique',
      btn1Style: 'purple',
      btn2Text: 'Découvrir les ressources gratuites',
      btn2Url: '/ressources',
      btn2Style: 'white',
    }),
  },
];

export async function GET() {
  try {
    // Check missing sections and auto-seed them
    for (const sec of DEFAULT_SECTIONS) {
      const existing = await prisma.homepageSection.findUnique({
        where: { sectionKey: sec.sectionKey },
      });
      if (!existing) {
        await prisma.homepageSection.create({
          data: sec,
        });
      }
    }

    const sections = await prisma.homepageSection.findMany({
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ sections });
  } catch (error) {
    console.error('Error fetching homepage sections:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'EDITOR')) {
      return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 });
    }

    const body = await request.json();

    // Check if reset action requested
    if (body.resetDefaults) {
      for (const sec of DEFAULT_SECTIONS) {
        await prisma.homepageSection.upsert({
          where: { sectionKey: sec.sectionKey },
          update: {
            title: sec.title,
            subtitle: sec.subtitle,
            isEnabled: sec.isEnabled,
            order: sec.order,
            settings: sec.settings,
          },
          create: sec,
        });
      }

      const sections = await prisma.homepageSection.findMany({
        orderBy: { order: 'asc' },
      });

      return NextResponse.json({ success: true, sections });
    }

    // 1. Single Section Update
    if (body.id) {
      const { id, isEnabled, title, subtitle, settings, order } = body;

      const serializedSettings =
        typeof settings === 'object' ? JSON.stringify(settings) : settings || '{}';

      const updated = await prisma.homepageSection.update({
        where: { id },
        data: {
          isEnabled,
          title,
          subtitle,
          settings: serializedSettings,
          order,
        },
      });

      return NextResponse.json({ success: true, section: updated });
    }

    // 2. Bulk Section Array Update
    if (body.sections && Array.isArray(body.sections)) {
      for (let i = 0; i < body.sections.length; i++) {
        const sec = body.sections[i];
        const serializedSettings =
          typeof sec.settings === 'object' ? JSON.stringify(sec.settings) : sec.settings || '{}';

        await prisma.homepageSection.upsert({
          where: { sectionKey: sec.sectionKey },
          update: {
            isEnabled: sec.isEnabled,
            title: sec.title,
            subtitle: sec.subtitle,
            order: i,
            settings: serializedSettings,
          },
          create: {
            sectionKey: sec.sectionKey,
            title: sec.title,
            subtitle: sec.subtitle,
            isEnabled: sec.isEnabled,
            order: i,
            settings: serializedSettings,
          },
        });
      }

      const updatedSections = await prisma.homepageSection.findMany({
        orderBy: { order: 'asc' },
      });

      try {
        revalidatePath('/');
        revalidatePath('/boutique');
        revalidatePath('/admin/homepage');
      } catch (e) {}

      return NextResponse.json({ success: true, sections: updatedSections });
    }

    return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
  } catch (error) {
    console.error('Error updating homepage sections:', error);
    return NextResponse.json({ error: 'Erreur lors de la sauvegarde.' }, { status: 500 });
  }
}
