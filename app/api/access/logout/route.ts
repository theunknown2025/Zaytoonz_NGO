import { NextResponse } from 'next/server';
import { ACCESS_COOKIE_NAME } from '@/app/lib/accessGate';

export const dynamic = 'force-dynamic';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(ACCESS_COOKIE_NAME, '', { path: '/', maxAge: 0 });
  return response;
}
