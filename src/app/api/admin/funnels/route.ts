import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const funnels = await prisma.funnel.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        steps: {
          orderBy: { position: 'asc' },
        },
        automationRules: true,
      },
    });

    return NextResponse.json({ funnels });
  } catch (error: any) {
    console.error('Error fetching funnels:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, domain, objective = 'AUDIENCE', currency = 'EUR' } = body;

    if (!name) {
      return NextResponse.json({ error: 'Le nom du tunnel est obligatoire' }, { status: 400 });
    }

    // Generate slug from name
    let baseSlug = name
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'tunnel';

    let slug = baseSlug;
    let counter = 1;
    while (await prisma.funnel.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Define default steps according to selected objective
    let initialSteps: { name: string; slug: string; type: string; position: number }[] = [];

    if (objective === 'AUDIENCE') {
      initialSteps = [
        { name: 'Page de capture', slug: 'page-de-capture', type: 'OPTIN_PAGE', position: 1 },
        { name: 'Page de remerciement', slug: 'page-de-remerciement', type: 'THANK_YOU_PAGE', position: 2 },
      ];
    } else if (objective === 'SALES') {
      initialSteps = [
        { name: 'Page de vente', slug: 'page-de-vente', type: 'SALES_PAGE', position: 1 },
        { name: 'Bon de commande', slug: 'bon-de-commande', type: 'ORDER_FORM', position: 2 },
        { name: 'Page de remerciement', slug: 'page-de-remerciement', type: 'THANK_YOU_PAGE', position: 3 },
      ];
    } else if (objective === 'WEBINAR') {
      initialSteps = [
        { name: 'Inscription Webinaire', slug: 'inscription-webinaire', type: 'OPTIN_PAGE', position: 1 },
        { name: 'Confirmation Webinaire', slug: 'confirmation-webinaire', type: 'THANK_YOU_PAGE', position: 2 },
      ];
    } else {
      initialSteps = [
        { name: 'Page de capture', slug: 'page-de-capture', type: 'OPTIN_PAGE', position: 1 },
      ];
    }

    const funnel = await prisma.funnel.create({
      data: {
        name,
        slug,
        domain: domain || 'solopreneur.pro',
        objective,
        currency,
        status: 'ACTIVE',
        steps: {
          create: initialSteps,
        },
      },
      include: {
        steps: true,
      },
    });

    return NextResponse.json({ funnel }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating funnel:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
