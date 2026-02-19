import { getCurrentUserServer } from '@/services';

import type { ServerBootstrapResult } from './types';

export async function getServerBootstrap(): Promise<ServerBootstrapResult> {
  const userRes = await getCurrentUserServer();

  if (!userRes.ok) {
    return { ok: false, error: { message: 'Failed to load current user' } };
  }

  return {
    ok: true,
    data: {
      currentUser: userRes.data.currentUser ?? null,
      serverTimeIso: new Date().toISOString(),
    },
  };
}
