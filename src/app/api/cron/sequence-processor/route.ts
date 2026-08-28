import { NextResponse } from 'next/server';
import { processPendingSequenceQueue } from '@/lib/campaign-dispatcher';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await processPendingSequenceQueue();
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Error in sequence processor route:', error);
    return NextResponse.json({ error: error?.message || 'Erreur du processeur de séquence' }, { status: 500 });
  }
}

export async function POST() {
  return GET();
}
