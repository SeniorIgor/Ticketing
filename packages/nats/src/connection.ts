import type { JetStreamClient, JetStreamManager, NatsConnection } from 'nats';
import { connect } from 'nats';

import type { NatsConnectConfig } from './config';
import { normalizeConfig } from './config';

export type NatsDeps = {
  connection: NatsConnection;
  client: JetStreamClient;
  manager: JetStreamManager;
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

  const config = normalizeConfig(cfg);

  connecting = (async () => {
    const connection = await connect({
      servers: config.servers,
      name: config.name,
      ...(config.connectionOptions ?? {}),
    });

    const client = connection.jetstream();
    const manager = await connection.jetstreamManager();

    deps = { connection, client, manager, logger: config.logger };

    deps.logger.info(`[nats] connected: ${connection.getServer()}`);

    connection
      .closed()
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

interface RegisterNatsSignalHandlersParams {
  onSignal?: (signal: string) => void;
}

export function registerNatsSignalHandlers(opts?: RegisterNatsSignalHandlersParams) {
  const handler = async (signal: string) => {
    opts?.onSignal?.(signal);

    try {
      await drainNats();
    } catch (error) {
      deps?.logger.error('[nats] drain failed', error);
      // don't exit; let the app decide
    }
  };

  process.on('SIGINT', () => void handler('SIGINT'));
  process.on('SIGTERM', () => void handler('SIGTERM'));
}
