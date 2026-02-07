import mongoose from 'mongoose';

import type { CreatePullWorkerResult } from '@org/nats';
import { drainNats } from '@org/nats';

import { startOrdersListeners, stopWorkers } from './events/listeners';
import { createApp } from './app';
import { connectMongo, startNats } from './config';

const port = process.env.ORDERS_PORT ? Number(process.env.ORDERS_PORT) : 4003;

const app = createApp();

let server: ReturnType<typeof app.listen>;
let workers: CreatePullWorkerResult[] = [];
let isShuttingDown = false;

const shutdown = async (signal: string) => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  console.log(`🛑 ${signal} received. Closing gracefully...`);

  stopWorkers(workers);

  await drainNats().catch((error) => console.error('NATS drain failed', error));

  await new Promise<void>((resolve) => {
    if (!server) {
      return resolve();
    }

    server.close(() => {
      console.log('🧹 HTTP server closed');
      resolve();
    });
  });

  await mongoose.connection.close(false);
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

async function start() {
  try {
    await connectMongo();
    await startNats();
    workers = await startOrdersListeners();

    server = app.listen(port, () => {
      console.log(`[ ready ] Orders listening on ${port}`);
    });
  } catch (err) {
    console.error('❌ Startup failed', err);
    process.exit(1);
  }
}

start();
