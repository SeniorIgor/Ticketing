import './mocks/nats';

import { clearTestDb, setupTestDb, teardownTestDb } from './setup';

beforeAll(async () => {
  await setupTestDb();
});

beforeEach(async () => {
  await clearTestDb();
  jest.clearAllMocks();
});

afterAll(async () => {
  await teardownTestDb();
});
