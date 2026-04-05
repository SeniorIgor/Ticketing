import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { ROUTES } from '@/constants';

const AUTH_COOKIE_NAME = 'auth';
const REFRESH_COOKIE_NAME = 'refresh';

const protectedRoutes = [ROUTES.orders.root, ROUTES.tickets.mine, ROUTES.tickets.new, ROUTES.payments.root];
const guestOnlyRoutes = [ROUTES.signIn, ROUTES.signUp];

const INTERNAL_API_BASE_URL = process.env.INTERNAL_API_BASE_URL;

type AuthState = 'authorized' | 'guest' | 'error';

export type AuthRedirectResult = {
  requestHeaders: Headers;
  response?: NextResponse;
  setCookies: string[];
};

function startsWithAny(pathname: string, routes: string[]) {
  return routes.some((route) => pathname.startsWith(route));
}

function isApiPath(pathname: string) {
  return pathname.startsWith('/api/');
}

function getCookieAssignments(cookieHeader: string) {
  return cookieHeader
    .split(';')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const separatorIndex = entry.indexOf('=');

      if (separatorIndex === -1) {
        return null;
      }

      return {
        name: entry.slice(0, separatorIndex),
        value: entry.slice(separatorIndex + 1),
      };
    })
    .filter((entry): entry is { name: string; value: string } => entry !== null);
}

function parseSetCookie(setCookie: string) {
  const [cookiePair] = setCookie.split(';', 1);
  const separatorIndex = cookiePair.indexOf('=');

  if (separatorIndex === -1) {
    return null;
  }

  return {
    name: cookiePair.slice(0, separatorIndex),
    value: cookiePair.slice(separatorIndex + 1),
  };
}

function getSetCookies(response: Response): string[] {
  const getSetCookie = response.headers.getSetCookie;

  if (typeof getSetCookie === 'function') {
    return getSetCookie.call(response.headers);
  }

  const setCookie = response.headers.get('set-cookie');
  return setCookie ? [setCookie] : [];
}

function mergeSetCookies(existing: string[], incoming: string[]) {
  const byName = new Map<string, string>();

  for (const setCookie of [...existing, ...incoming]) {
    const cookie = parseSetCookie(setCookie);

    if (!cookie) {
      continue;
    }

    byName.set(cookie.name, setCookie);
  }

  return Array.from(byName.values());
}

function applySetCookiesToRequestHeaders(requestHeaders: Headers, setCookies: string[]) {
  const cookies = new Map<string, string>();

  for (const cookie of getCookieAssignments(requestHeaders.get('cookie') ?? '')) {
    cookies.set(cookie.name, cookie.value);
  }

  for (const setCookie of setCookies) {
    const cookie = parseSetCookie(setCookie);

    if (!cookie) {
      continue;
    }

    if (!cookie.value) {
      cookies.delete(cookie.name);
      continue;
    }

    cookies.set(cookie.name, cookie.value);
  }

  if (cookies.size === 0) {
    requestHeaders.delete('cookie');
    return;
  }

  requestHeaders.set(
    'cookie',
    Array.from(cookies.entries())
      .map(([name, value]) => `${name}=${value}`)
      .join('; '),
  );
}

async function callAuthBackend(
  path: string,
  requestHeaders: Headers,
  method: 'GET' | 'POST',
): Promise<{ state: AuthState; setCookies: string[] }> {
  if (!INTERNAL_API_BASE_URL) {
    return { state: 'error', setCookies: [] };
  }

  try {
    const res = await fetch(`${INTERNAL_API_BASE_URL}${path}`, {
      method,
      headers: {
        cookie: requestHeaders.get('cookie') ?? '',
        'x-request-id': requestHeaders.get('x-request-id') ?? '',
        'x-forwarded-host': requestHeaders.get('host') ?? '',
        'x-forwarded-proto': requestHeaders.get('x-forwarded-proto') ?? 'https',
      },
      cache: 'no-store',
    });

    const setCookies = getSetCookies(res);

    if (res.status === 401) {
      return { state: 'guest', setCookies };
    }

    if (!res.ok) {
      return { state: 'error', setCookies };
    }

    const body = (await res.json().catch(() => null)) as { currentUser?: unknown } | null;

    if (!body?.currentUser) {
      return { state: 'guest', setCookies };
    }

    return { state: 'authorized', setCookies };
  } catch {
    return { state: 'error', setCookies: [] };
  }
}

async function resolveAuthState(
  requestHeaders: Headers,
  hasAuthCookie: boolean,
  hasRefreshCookie: boolean,
): Promise<{ state: AuthState; setCookies: string[] }> {
  if (!hasAuthCookie && !hasRefreshCookie) {
    return { state: 'guest', setCookies: [] };
  }

  let setCookies: string[] = [];

  if (hasAuthCookie) {
    const currentUserResult = await callAuthBackend('/api/v1/users/current-user', requestHeaders, 'GET');

    setCookies = mergeSetCookies(setCookies, currentUserResult.setCookies);
    applySetCookiesToRequestHeaders(requestHeaders, currentUserResult.setCookies);

    if (currentUserResult.state === 'authorized') {
      return { state: 'authorized', setCookies };
    }

    if (currentUserResult.state === 'error') {
      return { state: 'error', setCookies };
    }
  }

  if (!hasRefreshCookie) {
    return { state: 'guest', setCookies };
  }

  const refreshResult = await callAuthBackend('/api/v1/users/refresh', requestHeaders, 'POST');

  setCookies = mergeSetCookies(setCookies, refreshResult.setCookies);
  applySetCookiesToRequestHeaders(requestHeaders, refreshResult.setCookies);

  return { state: refreshResult.state, setCookies };
}

export async function handleAuthRedirect(
  request: NextRequest,
  requestHeaders: Headers,
): Promise<AuthRedirectResult | null> {
  const { pathname } = request.nextUrl;

  if (isApiPath(pathname)) {
    return null;
  }

  const isProtected = startsWithAny(pathname, protectedRoutes);
  const isGuestOnly = startsWithAny(pathname, guestOnlyRoutes);

  const hasAuthCookie = request.cookies.has(AUTH_COOKIE_NAME);
  const hasRefreshCookie = request.cookies.has(REFRESH_COOKIE_NAME);

  if (!isProtected && !isGuestOnly && !hasAuthCookie && !hasRefreshCookie) {
    return null;
  }

  const authResult = await resolveAuthState(requestHeaders, hasAuthCookie, hasRefreshCookie);

  if (isProtected && authResult.state === 'guest') {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.signIn;

    return {
      requestHeaders,
      response: NextResponse.redirect(url),
      setCookies: authResult.setCookies,
    };
  }

  if (isGuestOnly && authResult.state === 'authorized') {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.home;

    return {
      requestHeaders,
      response: NextResponse.redirect(url),
      setCookies: authResult.setCookies,
    };
  }

  if (authResult.setCookies.length > 0) {
    return {
      requestHeaders,
      setCookies: authResult.setCookies,
    };
  }

  return null;
}
