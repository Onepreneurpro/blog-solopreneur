import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { name, type = 'OPTIN_PAGE', templateId, templateName, content } = body;

    if (!name) {
      return NextResponse.json({ error: 'Le nom de l\'étape est obligatoire' }, { status: 400 });
    }

    const funnel = await prisma.funnel.findUnique({
      where: { id: params.id },
      include: { steps: true },
    });

    if (!funnel) {
      return NextResponse.json({ error: 'Tunnel introuvable' }, { status: 404 });
    }

    let baseSlug = name
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'etape';

    let slug = baseSlug;
    let counter = 1;
    while (funnel.steps.some((s) => s.slug === slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const step = await prisma.funnelStep.create({
      data: {
        funnelId: params.id,
        name,
        slug,
        type,
        position: funnel.steps.length + 1,
        templateId: templateId || null,
        templateName: templateName || null,
        content: content || null,
      },
    });

    return NextResponse.json({ step }, { status: 201 });
  } catch (error: any) {
    console.error('Error adding funnel step:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { stepId, templateId, templateName, content, name, isActive } = body;

    if (!stepId) {
      return NextResponse.json({ error: 'ID de l\'étape manquant' }, { status: 400 });
    }

    const step = await prisma.funnelStep.update({
      where: { id: stepId },
      data: {
        ...(name && { name }),
        ...(templateId !== undefined && { templateId }),
        ...(templateName !== undefined && { templateName }),
        ...(content !== undefined && { content }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ step });
  } catch (error: any) {
    console.error('Error updating funnel step:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
