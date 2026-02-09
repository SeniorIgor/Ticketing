import './mocks/nats';

import { createPullWorkerMock, getNatsMock, publishEventMock } from './mocks/nats';
import { clearTestDb, setupTestDb, teardownTestDb } from './setup';

beforeAll(async () => {
  await setupTestDb();
});

beforeEach(async () => {
  await clearTestDb();
  createPullWorkerMock.mockClear();
  publishEventMock.mockClear();
  getNatsMock.mockClear();
});

afterAll(async () => {
  await teardownTestDb();
});
