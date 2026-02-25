import { createPullWorkerMock, getNatsMock, installNatsMock, publishEventMock } from './mocks/nats';

installNatsMock();

beforeEach(() => {
  jest.useRealTimers();
  createPullWorkerMock.mockClear();
  publishEventMock.mockClear();
  getNatsMock.mockClear();
});

afterAll(() => {
  jest.useRealTimers();
});
