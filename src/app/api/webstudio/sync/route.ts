import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { stepId, webstudioData } = body;

    if (!stepId) {
      return NextResponse.json({ error: 'stepId is required' }, { status: 400 });
    }

    const contentStr = typeof webstudioData === 'string' ? webstudioData : JSON.stringify(webstudioData);

    const updatedStep = await prisma.funnelStep.update({
      where: { id: stepId },
      data: {
        content: contentStr,
      },
    });

    return NextResponse.json({ success: true, step: updatedStep });
  } catch (err: any) {
    console.error('[Webstudio Sync Error]', err);
    return NextResponse.json({ error: err?.message || 'Failed to sync Webstudio project' }, { status: 500 });
  }
}
