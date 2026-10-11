import { NextRequest, NextResponse } from 'next/server';
import {
  ACCESS_COOKIE_NAME,
  ACCESS_LOGIN_PATH,
  hasAccess,
  isGatedPath,
} from './app/lib/accessGate';

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (!isGatedPath(pathname)) return NextResponse.next();

  if (await hasAccess(request.cookies.get(ACCESS_COOKIE_NAME)?.value)) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = ACCESS_LOGIN_PATH;
  loginUrl.search = '';
  loginUrl.searchParams.set('next', `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
