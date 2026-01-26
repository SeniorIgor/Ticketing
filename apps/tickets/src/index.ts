import mongoose from 'mongoose';

import { createApp } from './app';
import { connectMongo } from './config';

const port = process.env.TICKETS_PORT ? Number(process.env.TICKETS_PORT) : 4002;

const app = createApp();

let server: ReturnType<typeof app.listen>;
let isShuttingDown = false;

const shutdown = async (signal: string) => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  console.log(`🛑 ${signal} received. Closing gracefully...`);

  await mongoose.connection.close(false);

  server?.close(() => {
    console.log('🧹 HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

async function start() {
  try {
    await connectMongo();

    server = app.listen(port, () => {
      console.log(`[ ready ] Tickets listening on ${port}`);
    });
  } catch (err) {
    console.error('❌ Startup failed', err);
    process.exit(1);
  }
}

start();
