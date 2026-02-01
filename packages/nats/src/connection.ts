import type { JetStreamClient, JetStreamManager, NatsConnection } from 'nats';
import { connect } from 'nats';

import type { NatsConnectConfig } from './config';
import { normalizeConfig } from './config';

export type NatsDeps = {
  nc: NatsConnection;
  js: JetStreamClient;
  jsm: JetStreamManager;
  logger: ReturnType<typeof normalizeConfig>['logger'];
};

let deps: NatsDeps | null = null;
let connecting: Promise<NatsDeps> | null = null;

export async function connectNats(cfg: NatsConnectConfig): Promise<NatsDeps> {
  if (deps) {
    return deps;
  }
  if (connecting) {
    return connecting;
  }

  const c = normalizeConfig(cfg);

  connecting = (async () => {
    const nc = await connect({
      servers: c.servers,
      name: c.name,
      ...(c.connectionOptions ?? {}),
    });

    const js = nc.jetstream();
    const jsm = await nc.jetstreamManager();

    deps = { nc, js, jsm, logger: c.logger };

    deps.logger.info(`[nats] connected: ${nc.getServer()}`);
    nc.closed()
      .then((err) => {
        if (err) {
          deps?.logger.error('[nats] connection closed with error', err);
        } else {
          deps?.logger.info('[nats] connection closed');
        }
      })
      .catch(() => undefined);

    return deps;
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
  await deps.nc.drain();
  deps.logger.info('[nats] drained');
}

export async function closeNats(): Promise<void> {
  if (!deps) {
    return;
  }
  deps.logger.info('[nats] closing...');
  await deps.nc.close();
  deps.logger.info('[nats] closed');
}

export function registerNatsSignalHandlers(opts?: { onSignal?: (sig: string) => void }) {
  const handler = async (sig: string) => {
    opts?.onSignal?.(sig);
    try {
      await drainNats();
    } catch (e) {
      deps?.logger.error('[nats] drain failed', e);
      // don't exit; let the app decide
    }
  };

  process.on('SIGINT', () => void handler('SIGINT'));
  process.on('SIGTERM', () => void handler('SIGTERM'));
}
