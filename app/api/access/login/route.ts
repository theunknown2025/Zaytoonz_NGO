import { NextRequest, NextResponse } from 'next/server';
import {
  ACCESS_COOKIE_NAME,
  ACCESS_SESSION_SECONDS,
  checkAccessCredentials,
  createAccessToken,
} from '@/app/lib/accessGate';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  let email = '';
  let password = '';
  try {
    const body = await request.json();
    email = typeof body?.email === 'string' ? body.email : '';
    password = typeof body?.password === 'string' ? body.password : '';
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  if (!checkAccessCredentials(email, password)) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  const forwardedProto = request.headers.get('x-forwarded-proto');
  const isHttps = (forwardedProto || request.nextUrl.protocol.replace(':', '')) === 'https';

  const response = NextResponse.json({ success: true });
  response.cookies.set(ACCESS_COOKIE_NAME, await createAccessToken(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: isHttps,
    path: '/',
    maxAge: ACCESS_SESSION_SECONDS,
  });
  return response;
}
