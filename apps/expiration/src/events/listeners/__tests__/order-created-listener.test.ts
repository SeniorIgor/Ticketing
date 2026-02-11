import type { Queue } from 'bullmq';

import type { OrderCreatedData } from '@org/contracts';
import { OrderCreatedEvent } from '@org/contracts';
import { makeMessageContextFactory } from '@org/test-utils';

import { createPullWorkerMock, getLastHandler, getNatsMock } from '../../../test/mocks/nats';
import { startOrderCreatedListener } from '../order-created-listener';

const scheduleExpirationMock = jest.fn().mockResolvedValue(undefined);

jest.mock('../../../queue', () => ({
  scheduleExpiration: (...args: unknown[]) => scheduleExpirationMock(...args),
}));

const ctx = makeMessageContextFactory({ subject: 'orders.created' });

describe('expiration: OrderCreated listener', () => {
  beforeEach(() => {
    scheduleExpirationMock.mockClear();
  });

  it('wires createPullWorker with correct contract', async () => {
    const queue = {} as Queue;

    await startOrderCreatedListener({ queue });

    expect(createPullWorkerMock).toHaveBeenCalledTimes(1);

    const [opts] = createPullWorkerMock.mock.calls[0];
    expect(opts.def).toBe(OrderCreatedEvent);
    expect(opts.stream).toBeDefined();
    expect(opts.durable_name).toBeDefined();
  });

  it('calls scheduleExpiration with deps.queue and ctx.correlationId', async () => {
    const queue = {} as Queue;

    await startOrderCreatedListener({ queue });

    const handler = getLastHandler<OrderCreatedData>();

    await handler(
      {
        id: 'o1',
        userId: 'buyer',
        status: 'created',
        expiresAt: '2026-02-11T10:00:00.000Z',
        ticket: { id: 't1', price: 10 },
        version: 0,
      },
      ctx({ correlationId: 'req-123', seq: 42 }),
    );

    expect(scheduleExpirationMock).toHaveBeenCalledTimes(1);
    expect(scheduleExpirationMock).toHaveBeenCalledWith({
      queue,
      orderId: 'o1',
      expiresAt: '2026-02-11T10:00:00.000Z',
      correlationId: 'req-123',
    });

    const nats = getNatsMock.mock.results[0]?.value;
    expect(nats?.logger.info).toHaveBeenCalledTimes(1);
  });

  it('passes correlationId undefined when ctx has none', async () => {
    const queue = {} as Queue;

    await startOrderCreatedListener({ queue });

    const handler = getLastHandler<OrderCreatedData>();

    await handler(
      {
        id: 'o1',
        userId: 'buyer',
        status: 'created',
        expiresAt: new Date().toISOString(),
        ticket: { id: 't1', price: 10 },
        version: 0,
      },
      ctx({ correlationId: undefined }),
    );

    expect(scheduleExpirationMock).toHaveBeenCalledWith(
      expect.objectContaining({
        correlationId: undefined,
      }),
    );
  });
});
