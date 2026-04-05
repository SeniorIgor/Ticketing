import mongoose from 'mongoose';

import { parsePositiveInt, retry } from '@org/core';

function getMongoRetryConfig() {
  const defaultAttempts = process.env.NODE_ENV === 'production' ? 0 : 60;
  const attempts = parsePositiveInt('MONGO_CONNECT_MAX_ATTEMPTS', defaultAttempts);

  return {
    delayMs: parsePositiveInt('MONGO_CONNECT_RETRY_DELAY_MS', 1000),
    maxAttempts: attempts === 0 ? undefined : attempts,
  };
}

function isRetryableMongoError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const code = 'code' in error ? error.code : undefined;
  const message = 'message' in error ? error.message : undefined;
  const name = 'name' in error ? error.name : undefined;

  return (
    code === 'ECONNREFUSED' ||
    code === 'ENOTFOUND' ||
    code === 'EAI_AGAIN' ||
    name === 'MongooseServerSelectionError' ||
    (typeof message === 'string' &&
      (message.includes('ECONNREFUSED') || message.includes('Server selection timed out')))
  );
}

export async function connectMongo(): Promise<void> {
  const mongoUri = process.env.AUTH_MONGO_URI;

  if (!mongoUri) {
    throw new Error('AUTH_MONGO_URI is not defined');
  }

  const retryConfig = getMongoRetryConfig();
  await retry(
    () =>
      mongoose
        .connect(mongoUri, {
          autoIndex: false,
          serverSelectionTimeoutMS: 5000,
        })
        .catch(async (error) => {
          await mongoose.disconnect().catch(() => undefined);
          throw error;
        }),
    {
      label: '[mongo] auth initial connection',
      delayMs: retryConfig.delayMs,
      maxAttempts: retryConfig.maxAttempts,
      logger: console,
      shouldRetry: isRetryableMongoError,
    },
  );

  console.log('✅ MongoDB connected');
}
