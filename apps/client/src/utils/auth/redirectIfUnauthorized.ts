import { redirect } from 'next/navigation';

import { ROUTES } from '@/constants';

export function redirectIfUnauthorized(res: { ok: boolean; error?: { status: number } }) {
  if (!res.ok && res.error?.status === 401) {
    redirect(ROUTES.signIn);
  }
}
