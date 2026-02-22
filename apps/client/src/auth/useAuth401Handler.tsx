'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { ROUTES } from '@/constants';
import { logout, selectIsAuthenticated, useAppDispatch, useAppSelector } from '@/store';

import { onUnauthorized } from './sessionEvents';

function buildNext(pathname: string | null, searchParams: URLSearchParams | null): string {
  const p = pathname ?? ROUTES.home;
  const q = searchParams?.toString();
  return q ? `${p}?${q}` : p;
}

function isSignInPath(pathname: string | null): boolean {
  if (!pathname) {
    return false;
  }
  return pathname === ROUTES.signIn || pathname.startsWith(`${ROUTES.signIn}/`);
}

/**
 * Global 401 handler:
 * If we *believe* user is authed and any API returns 401:
 * - logout
 * - redirect to /signin?next=...
 */
export function useAuth401Handler() {
  const dispatch = useAppDispatch();
  const isAuthed = useAppSelector(selectIsAuthenticated);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // prevent multiple rapid redirects if several requests 401 at once
  const redirectingRef = useRef(false);

  useEffect(() => {
    return onUnauthorized(() => {
      if (!isAuthed) {
        return;
      }

      // avoid loops if we are already on /signin
      if (isSignInPath(pathname)) {
        dispatch(logout());
        return;
      }

      if (redirectingRef.current) {
        return;
      }
      redirectingRef.current = true;

      dispatch(logout());

      const next = buildNext(pathname, searchParams);
      router.replace(`${ROUTES.signIn}?next=${encodeURIComponent(next)}`);
    });
  }, [dispatch, isAuthed, pathname, router, searchParams]);
}
