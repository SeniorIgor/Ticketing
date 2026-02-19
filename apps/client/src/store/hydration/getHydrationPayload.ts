import { getCurrentUserServer } from '@/services';
import type { HydrationPayload } from '@/store/hydration/types';

export async function getHydrationPayload(): Promise<{ ok: true; data: HydrationPayload }> {
  const userRes = await getCurrentUserServer();

  // 401 => not authenticated => hydrate as guest
  if (!userRes.ok && userRes.error?.status === 401) {
    return {
      ok: true,
      data: {
        auth: { currentUser: null, isAuthenticated: false },
      },
    };
  }

  // Other upstream errors: degrade to guest (don’t crash the whole app)
  if (!userRes.ok) {
    return {
      ok: true,
      data: {
        auth: { currentUser: null, isAuthenticated: false },
      },
    };
  }

  return {
    ok: true,
    data: {
      auth: {
        currentUser: userRes.data.currentUser ?? null,
        isAuthenticated: !!userRes.data.currentUser,
      },
    },
  };
}
