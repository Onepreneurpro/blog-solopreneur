import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { stepId, triggerType = 'OPTIN', actionType = 'SUBSCRIBE_CAMPAIGN', targetId, targetName } = body;

    const rule = await prisma.funnelAutomationRule.create({
      data: {
        funnelId: params.id,
        stepId: stepId || null,
        triggerType,
        actionType,
        targetId: targetId || null,
        targetName: targetName || null,
      },
    });

    return NextResponse.json({ rule }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating automation rule:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ruleId = searchParams.get('ruleId');

    if (!ruleId) {
      return NextResponse.json({ error: 'ruleId manquant' }, { status: 400 });
    }

    await prisma.funnelAutomationRule.delete({
      where: { id: ruleId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting automation rule:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
