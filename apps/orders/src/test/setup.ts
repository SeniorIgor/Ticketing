import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongo: MongoMemoryServer | null = null;
const worker = process.env.JEST_WORKER_ID ?? '0';

export async function setupTestDb(): Promise<void> {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('MongoMemoryServer can only be used in test environment');
  }

  mongo = await MongoMemoryServer.create();

  await mongoose.connect(mongo.getUri(), { dbName: `test_${worker}`, autoIndex: false });
}

export async function clearTestDb(): Promise<void> {
  const db = mongoose.connection.db;
  if (!db) {
    return;
  }

  const collections = await db.collections();
  if (!collections) {
    return;
  }

  await Promise.all(collections.map((c) => c.deleteMany({})));
}

export async function teardownTestDb(): Promise<void> {
  await mongoose.connection.close();

  if (mongo) {
    await mongo.stop();
    mongo = null;
  }
}
