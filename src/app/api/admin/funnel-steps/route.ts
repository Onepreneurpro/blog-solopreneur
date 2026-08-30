import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { funnelId, name, type, slug, contentJson } = body;

    if (!funnelId || !name) {
      return NextResponse.json({ error: 'Champs obligatoires manquants (funnelId, name)' }, { status: 400 });
    }

    // Determine slug if not provided
    const stepSlug = slug || name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `page-${Date.now()}`;

    // Get highest position number
    const existingSteps = await prisma.funnelStep.findMany({
      where: { funnelId },
      orderBy: { position: 'desc' },
      take: 1,
    });

    const nextPosition = existingSteps.length > 0 ? existingSteps[0].position + 1 : 1;

    const initialContent = contentJson
      ? (typeof contentJson === 'string' ? contentJson : JSON.stringify(contentJson))
      : JSON.stringify({
          ROOT: {
            type: { resolvedName: 'Container' },
            isCanvas: true,
            props: { padding: 40, bgColor: '#ffffff', borderRadius: 0, pageLayoutMode: 'full' },
            displayName: 'Section Conteneur',
            custom: {},
            hidden: false,
            nodes: [],
            linkedNodes: {},
          },
        });

    const step = await prisma.funnelStep.create({
      data: {
        funnelId,
        name,
        slug: stepSlug,
        type: type || 'OPTIN_PAGE',
        position: nextPosition,
        content: initialContent,
      },
    });

    return NextResponse.json({ step });
  } catch (error: any) {
    console.error('Error creating funnel step:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
