import './mocks';

import { clearTestDb, setupTestDb, teardownTestDb } from './setup';

beforeAll(async () => {
  await setupTestDb();
});

beforeEach(async () => {
  jest.useRealTimers();
  await clearTestDb();
  jest.clearAllMocks();
});

afterAll(async () => {
  jest.useRealTimers();

  await teardownTestDb();
});
