import './mocks';

import { createPullWorkerMock, getNatsMock, publishEventMock } from './mocks/nats';
import { clearTestDb, setupTestDb, teardownTestDb } from './setup';

beforeAll(async () => {
  await setupTestDb();
});

beforeEach(async () => {
  jest.useRealTimers();
  await clearTestDb();
  createPullWorkerMock.mockClear();
  publishEventMock.mockClear();
  getNatsMock.mockClear();
});

afterAll(async () => {
  jest.useRealTimers();

  await teardownTestDb();
});
