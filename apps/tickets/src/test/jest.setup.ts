import './mocks/nats';

import { clearTestDb, setupTestDb, teardownTestDb } from './setup';

beforeAll(async () => {
  await setupTestDb();
});

beforeEach(async () => {
  await clearTestDb();
});

afterAll(async () => {
  await teardownTestDb();
});
