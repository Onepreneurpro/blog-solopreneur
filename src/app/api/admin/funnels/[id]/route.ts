import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const funnel = await prisma.funnel.findUnique({
      where: { id: params.id },
      include: {
        steps: {
          orderBy: { position: 'asc' },
        },
        automationRules: {
          include: {
            step: true,
          },
        },
      },
    });

    if (!funnel) {
      return NextResponse.json({ error: 'Tunnel introuvable' }, { status: 404 });
    }

    return NextResponse.json({ funnel });
  } catch (error: any) {
    console.error('Error fetching funnel:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { name, domain, status, currency } = body;

    const funnel = await prisma.funnel.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(domain && { domain }),
        ...(status && { status }),
        ...(currency && { currency }),
      },
    });

    return NextResponse.json({ funnel });
  } catch (error: any) {
    console.error('Error updating funnel:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.funnel.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting funnel:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
