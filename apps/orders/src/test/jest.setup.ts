import './mocks/nats';

import { publishEventMock } from './mocks/nats';
import { clearTestDb, setupTestDb, teardownTestDb } from './setup';

beforeAll(async () => {
  await setupTestDb();
});

beforeEach(async () => {
  // Always ensure real timers for DB + supertest + mongoose internals
  jest.useRealTimers();

  await clearTestDb();
  publishEventMock.mockClear();
});

afterAll(async () => {
  // Extra safety: restore timers before teardown
  jest.useRealTimers();

  await teardownTestDb();
});
