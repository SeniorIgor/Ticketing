import { installNatsMock } from './mocks';
import { clearTestDb, setupTestDb, teardownTestDb } from './setup';

installNatsMock();

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
