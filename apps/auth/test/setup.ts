import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongo: MongoMemoryServer;

beforeAll(async () => {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('MongoMemoryServer can only be used in test environment');
  }

  mongo = await MongoMemoryServer.create();

  await mongoose.connect(mongo.getUri(), {
    dbName: 'test',
  });
});

beforeEach(async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongo.stop();
});
