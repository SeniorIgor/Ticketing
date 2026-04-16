import { DeliverPolicy } from 'nats';

import { connectNats, drainNats, ensureDurableConsumer, ensureStream } from '@org/nats';

import { buildConsumers, STREAMS } from './topology';

function env(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

function getDeliverPolicy(): DeliverPolicy {
  // In prod, we usually want to start from "now".
  // In dev, you often want to replay everything.
  return process.env.NODE_ENV === 'production' ? DeliverPolicy.New : DeliverPolicy.All;
}

function getReconcileMode(): 'none' | 'warn' | 'update' {
  // Default: warn in dev, update in prod.
  const fromEnv = process.env.NATS_RECONCILE_MODE as 'none' | 'warn' | 'update' | undefined;
  if (fromEnv) {
    return fromEnv;
  }
  return process.env.NODE_ENV === 'production' ? 'update' : 'warn';
}

async function main() {
  const servers = env('NATS_URL');

  const serviceName = process.env.SERVICE_NAME ?? 'event-bus-bootstrap';
  const instanceId = process.env.HOSTNAME ?? 'local';

  const deliver_policy = getDeliverPolicy();
  const reconcile = getReconcileMode();

  await connectNats({
    servers,
    name: `${serviceName}:${instanceId}`,
  });

  // STREAMS
  for (const s of STREAMS) {
    await ensureStream({
      stream: s.stream,
      subjects: s.subjects,
      reconcile,
    });
  }

  // CONSUMERS (durables)
  const consumers = buildConsumers(deliver_policy);
  for (const c of consumers) {
    await ensureDurableConsumer({
      stream: c.stream,
      durable_name: c.durable_name,
      filter_subjects: c.filter_subjects,
      deliver_policy: c.deliver_policy,
      ack_wait: c.ack_wait,
      reconcile,
    });
  }
}

const abort = new AbortController();
const shutdown = async (reason: string) => {
  console.log(`[event-bus-bootstrap] shutting down (${reason})...`);
  abort.abort();
  await drainNats();
};

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));

main()
  .then(async () => {
    await shutdown('completed');
    process.exit(0);
  })
  .catch(async (err) => {
    console.error(err);
    await shutdown('error');
    process.exit(1);
  });
