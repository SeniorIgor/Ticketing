import { connect } from 'nats';

import type { NatsConnectConfig } from './config';
import { normalizeConfig } from './config';
import type { NatsDeps } from './types';

let deps: NatsDeps | null = null;
let connecting: Promise<NatsDeps> | null = null;

async function createNatsDeps(config: ReturnType<typeof normalizeConfig>): Promise<NatsDeps> {
  const connection = await connect({
    servers: config.servers,
    name: config.name,
    ...(config.connectionOptions ?? {}),
  });

  const client = connection.jetstream();
  const manager = await connection.jetstreamManager();

  const newDeps: NatsDeps = { connection, client, manager, logger: config.logger, name: config.name };

  newDeps.logger.info(`[nats] connected: ${connection.getServer()}`);

  // log when connection closes
  connection
    .closed()
    .then((err) => {
      if (err) {
        newDeps.logger.error('[nats] connection closed with error', err);
      } else {
        newDeps.logger.info('[nats] connection closed');
      }

      deps = null;
    })
    .catch(() => undefined);

  return newDeps;
}

export async function connectNats(cfg: NatsConnectConfig): Promise<NatsDeps> {
  if (deps) {
    return deps;
  }

  if (connecting) {
    return connecting;
  }

  const config = normalizeConfig(cfg);

  connecting = (async () => {
    const created = await createNatsDeps(config);
    deps = created;
    return created;
  })();

  try {
    return await connecting;
  } finally {
    connecting = null;
  }
}

export function getNats(): NatsDeps {
  if (!deps) {
    throw new Error('NATS is not connected. Call connectNats() first.');
  }

  return deps;
}

export async function drainNats(): Promise<void> {
  if (!deps) {
    return;
  }

  deps.logger.info('[nats] draining...');
  await deps.connection.drain();
  deps.logger.info('[nats] drained');
}

export async function closeNats(): Promise<void> {
  if (!deps) {
    return;
  }

  deps.logger.info('[nats] closing...');
  await deps.connection.close();
  deps.logger.info('[nats] closed');
}
