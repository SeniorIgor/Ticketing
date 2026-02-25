/* eslint-disable @typescript-eslint/no-explicit-any */
import type { MessageContext } from '@org/nats';

export type ListenerHandler<TData> = (data: TData, ctx: MessageContext) => Promise<void> | void;

let _lastHandler: ListenerHandler<any> | null = null;

export function setLastHandler<TData>(h: ListenerHandler<TData>) {
  _lastHandler = h as ListenerHandler<any>;
}

export function getLastHandler<TData>(): ListenerHandler<TData> {
  if (!_lastHandler) {
    throw new Error('lastHandler was not set. Did you call start...Listener()?');
  }
  return _lastHandler as ListenerHandler<TData>;
}

export const publishEventMock = jest.fn().mockResolvedValue(undefined);

export const createPullWorkerMock = jest.fn().mockImplementation((_opts: any, handler: any) => {
  setLastHandler(handler);
  return Promise.resolve();
});

export const getNatsMock = jest.fn().mockReturnValue({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
});

export function installNatsMock() {
  jest.mock('@org/nats', () => {
    const actual = jest.requireActual('@org/nats');

    return {
      ...actual,
      publishEvent: publishEventMock,
      createPullWorker: createPullWorkerMock,
      getNats: getNatsMock,
    };
  });
}
