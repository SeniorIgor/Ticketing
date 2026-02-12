import { connectNats, ensureStream, Streams } from '@org/nats';

const SERVICE_NAME = 'expiration-service';
const INSTANCE_ID = process.env.HOSTNAME ?? 'local';

export async function startNats() {
  const servers = process.env.NATS_URL;
  if (!servers) {
    throw new Error('NATS_URL is required');
  }

  await connectNats({
    servers,
    name: `${SERVICE_NAME}:${INSTANCE_ID}`,
  });

  // Keep this dev-friendly. In prod you usually provision via infra.
  const shouldEnsure = process.env.NATS_ENSURE === 'true' || process.env.NODE_ENV !== 'production';

  if (shouldEnsure) {
    await ensureStream({
      stream: Streams.Expiration,
      subjects: ['expiration.*'],
      reconcile: 'warn',
    });
  }
}
