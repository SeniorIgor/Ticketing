import type { CreatePullWorkerResult } from '@org/nats';
import { drainNats } from '@org/nats';

import { createApp } from './app';
import { startNats } from './config';
import { startExpirationListeners, stopWorkers } from './events';
import { startExpirationWorker } from './queue';

const port = process.env.EXPIRATION_PORT ? Number(process.env.EXPIRATION_PORT) : 4004;

const app = createApp();

let server: ReturnType<typeof app.listen> | undefined;
let workers: CreatePullWorkerResult[] = [];

let isShuttingDown = false;
let runtimeShutdown: (() => Promise<void>) | undefined;

const shutdown = async (signal: string) => {
  if (isShuttingDown) {
    return;
  }
  isShuttingDown = true;

  console.log(`🛑 ${signal} received. Closing gracefully...`);

  stopWorkers(workers);

  await runtimeShutdown?.().catch((err) => console.error('Runtime shutdown failed', err));

  await drainNats().catch((err) => console.error('NATS drain failed', err));

  await new Promise<void>((resolve) => {
    if (!server) {
      return resolve();
    }
    server.close(() => {
      console.log('🧹 HTTP server closed');
      resolve();
    });
  });

  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

async function start() {
  try {
    await startNats();

    const { queue, shutdown } = await startExpirationWorker();
    runtimeShutdown = shutdown;

    workers = await startExpirationListeners({ queue });

    server = app.listen(port, () => {
      console.log(`[ ready ] Expiration listening on ${port}`);
    });
  } catch (err) {
    console.error('❌ Startup failed', err);
    process.exit(1);
  }
}

start();
