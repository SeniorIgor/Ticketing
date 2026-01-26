import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const AUTH_COOKIE_NAME = 'auth';
const guestOnlyRoutes = ['/signup', '/signin'];

export function handleGuestOnlyRedirect(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isGuestOnlyRoute = guestOnlyRoutes.some((route) => pathname.startsWith(route));

  if (!isGuestOnlyRoute) {
    return null;
  }

  const authCookie = request.cookies.get(AUTH_COOKIE_NAME);

  if (!authCookie) {
    return null;
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = '/';

  return NextResponse.redirect(redirectUrl);
}
