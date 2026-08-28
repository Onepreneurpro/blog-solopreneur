import { NextResponse } from 'next/server';
import { removeSessionCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  await removeSessionCookie();
  return NextResponse.redirect(new URL('/login', request.url));
}

export async function POST(request: Request) {
  await removeSessionCookie();
  return NextResponse.redirect(new URL('/login', request.url));
}
