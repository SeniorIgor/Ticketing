import mongoose from 'mongoose';

import { createApp } from './app';
import { connectMongo } from './config';

const port = process.env.AUTH_PORT ? Number(process.env.AUTH_PORT) : 4001;

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
      console.log(`[ ready ] Auth listening on ${port}`);
    });
  } catch (err) {
    console.error('❌ Startup failed', err);
    process.exit(1);
  }
}

start();
