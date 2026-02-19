import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { ROUTES } from '@/constants';

const AUTH_COOKIE_NAME = 'auth';

// Routes that require auth (your list)
const protectedRoutes = [ROUTES.orders.root, ROUTES.tickets.mine, ROUTES.tickets.new, ROUTES.payments.root];

// Routes that should be inaccessible for authed users
const guestOnlyRoutes = [ROUTES.signIn, ROUTES.signUp];

const INTERNAL_API_BASE_URL = process.env.INTERNAL_API_BASE_URL;

function startsWithAny(pathname: string, routes: string[]) {
  return routes.some((route) => pathname.startsWith(route));
}

async function verifyAuthWithBackend(request: NextRequest): Promise<'authorized' | 'unauthorized' | 'error'> {
  if (!INTERNAL_API_BASE_URL) {
    return 'error';
  }

  const url = `${INTERNAL_API_BASE_URL}/api/v1/users/current-user`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { cookie: request.headers.get('cookie') ?? '' },
      cache: 'no-store',
    });

    if (res.status === 401) {
      return 'unauthorized';
    }

    if (res.ok) {
      return 'authorized';
    }

    return 'error';
  } catch {
    return 'error';
  }
}

export async function handleAuthRedirect(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = startsWithAny(pathname, protectedRoutes);
  const isGuestOnly = startsWithAny(pathname, guestOnlyRoutes);

  if (!isProtected && !isGuestOnly) {
    return null;
  }

  const authCookie = request.cookies.get(AUTH_COOKIE_NAME);

  // 1) Protected routes: no cookie => redirect to signin
  if (isProtected && !authCookie) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.signIn;
    return NextResponse.redirect(url);
  }

  // 2) Guest-only routes: no cookie => allow
  if (isGuestOnly && !authCookie) {
    return null;
  }

  // Cookie exists => verify cheaply with backend
  const verdict = await verifyAuthWithBackend(request);

  // Protected routes
  if (isProtected) {
    if (verdict === 'unauthorized') {
      const url = request.nextUrl.clone();
      url.pathname = ROUTES.signIn;
      return NextResponse.redirect(url);
    }
    // if authorized or error -> allow (backend still enforces API security)
    return null;
  }

  // Guest-only routes
  if (isGuestOnly) {
    if (verdict === 'authorized') {
      const url = request.nextUrl.clone();
      url.pathname = ROUTES.home;
      return NextResponse.redirect(url);
    }
    // if unauthorized or error -> allow access to signin/signup
    return null;
  }

  return null;
}
