import './mocks/nats';

import { createPullWorkerMock, getNatsMock, publishEventMock } from './mocks/nats';

beforeEach(() => {
  jest.useRealTimers();
  createPullWorkerMock.mockClear();
  publishEventMock.mockClear();
  getNatsMock.mockClear();
});

afterAll(() => {
  jest.useRealTimers();
});
