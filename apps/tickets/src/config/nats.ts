import { connectNats, ensureStream } from '@org/nats';

export async function startNats() {
  const servers = process.env.NATS_URL;
  if (!servers) {
    throw new Error('NATS_URL is required');
  }

  await connectNats({
    servers,
    name: 'tickets-service',
  });

  // Keep this dev-friendly. In prod you usually provision via infra.
  const shouldEnsure = process.env.NATS_ENSURE === 'true' || process.env.NODE_ENV !== 'production';

  if (shouldEnsure) {
    await ensureStream({
      name: 'TICKETS',
      subjects: ['tickets.*'],
      reconcile: 'warn',
    });
  }
}
