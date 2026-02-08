import './mocks/nats';

import { publishEventMock } from './mocks/nats';
import { clearTestDb, setupTestDb, teardownTestDb } from './setup';

beforeAll(async () => {
  await setupTestDb();
});

beforeEach(async () => {
  await clearTestDb();
  publishEventMock.mockClear();
});

afterAll(async () => {
  await teardownTestDb();
});
