import { connect } from 'nats';

import { parsePositiveInt, retry } from '@org/core';

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

function getConnectRetryConfig() {
  const defaultAttempts = process.env.NODE_ENV === 'production' ? 0 : 60;
  const attempts = parsePositiveInt('NATS_CONNECT_MAX_ATTEMPTS', defaultAttempts);

  return {
    delayMs: parsePositiveInt('NATS_CONNECT_RETRY_DELAY_MS', 1000),
    maxAttempts: attempts === 0 ? undefined : attempts,
  };
}

function isRetryableConnectError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const code = 'code' in error ? error.code : undefined;
  const message = 'message' in error ? error.message : undefined;

  return (
    code === 'CONNECTION_REFUSED' ||
    code === 'ECONNREFUSED' ||
    code === 'TIMEOUT' ||
    code === '503' ||
    (typeof message === 'string' &&
      (message.includes('ECONNREFUSED') || message.includes('connection refused') || message.includes('timeout')))
  );
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
    const retryConfig = getConnectRetryConfig();
    const created = await retry(() => createNatsDeps(config), {
      label: '[nats] initial connection',
      delayMs: retryConfig.delayMs,
      maxAttempts: retryConfig.maxAttempts,
      logger: config.logger,
      shouldRetry: isRetryableConnectError,
    });

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
  const currentDeps = deps;
  if (!currentDeps) {
    return;
  }

  currentDeps.logger.info('[nats] draining...');
  await currentDeps.connection.drain();
  currentDeps.logger.info('[nats] drained');
}

export async function closeNats(): Promise<void> {
  const currentDeps = deps;
  if (!currentDeps) {
    return;
  }

  currentDeps.logger.info('[nats] closing...');
  await currentDeps.connection.close();
  currentDeps.logger.info('[nats] closed');
}

export function isNatsConnected(): boolean {
  return deps !== null;
}
