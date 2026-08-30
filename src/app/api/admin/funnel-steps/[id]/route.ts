import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const step = await prisma.funnelStep.findUnique({
      where: { id: params.id },
      include: { funnel: true },
    });

    if (!step) {
      return NextResponse.json({ error: 'Étape introuvable' }, { status: 404 });
    }

    return NextResponse.json({ step });
  } catch (error: any) {
    console.error('Error fetching funnel step:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { content, name, isActive } = body;

    const step = await prisma.funnelStep.update({
      where: { id: params.id },
      data: {
        ...(content !== undefined && { content }),
        ...(name && { name }),
        ...(isActive !== undefined && { isActive }),
      },
      include: { funnel: true },
    });

    return NextResponse.json({ step });
  } catch (error: any) {
    console.error('Error updating funnel step:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
