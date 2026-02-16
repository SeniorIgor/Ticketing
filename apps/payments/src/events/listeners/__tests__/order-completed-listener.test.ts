import mongoose from 'mongoose';

import type { OrderCompletedData } from '@org/contracts';
import { OrderCompletedEvent, OrderStatuses } from '@org/contracts';
import { RetryableError } from '@org/nats';
import { makeMessageContextFactory } from '@org/test-utils';

import { Order } from '../../../models/order';
import { expectDoc } from '../../../test/helpers';
import { createPullWorkerMock, getLastHandler } from '../../../test/mocks';
import { startOrderCompletedListener } from '../order-completed-listener';

const ctx = makeMessageContextFactory({ subject: 'orders.completed' });

describe('payments: OrderCompleted listener', () => {
  it('applies complete when version is next', async () => {
    const orderId = new mongoose.Types.ObjectId().toHexString();
    const ticketId = new mongoose.Types.ObjectId().toHexString();

    await Order.build({
      id: orderId,
      userId: 'user-1',
      status: OrderStatuses.Created,
      price: 10,
      version: 0,
    }).save();

    await startOrderCompletedListener();

    const handler = getLastHandler<OrderCompletedData>();
    await handler(
      {
        id: orderId,
        userId: 'user-1',
        version: 1,
        ticket: { id: ticketId },
      },
      ctx({ seq: 7 }),
    );

    const saved = await Order.findById(orderId);
    expectDoc(saved);

    expect(saved.status).toBe(OrderStatuses.Complete);
    expect(saved.version).toBe(1);
  });

  it('ignores duplicates (already applied same version)', async () => {
    const orderId = new mongoose.Types.ObjectId().toHexString();
    const ticketId = new mongoose.Types.ObjectId().toHexString();

    await Order.build({
      id: orderId,
      userId: 'user-1',
      status: OrderStatuses.Complete,
      price: 10,
      version: 1,
    }).save();

    await startOrderCompletedListener();

    const handler = getLastHandler<OrderCompletedData>();
    await expect(
      handler(
        {
          id: orderId,
          userId: 'user-1',
          version: 1,
          ticket: { id: ticketId },
        },
        ctx(),
      ),
    ).resolves.toBeUndefined();
  });

  it('throws RetryableError on out-of-order version', async () => {
    const orderId = new mongoose.Types.ObjectId().toHexString();
    const ticketId = new mongoose.Types.ObjectId().toHexString();

    await Order.build({
      id: orderId,
      userId: 'user-1',
      status: OrderStatuses.Created,
      price: 10,
      version: 0,
    }).save();

    await startOrderCompletedListener();

    const handler = getLastHandler<OrderCompletedData>();
    await expect(
      handler(
        {
          id: orderId,
          userId: 'user-1',
          version: 2,
          ticket: { id: ticketId },
        },
        ctx(),
      ),
    ).rejects.toBeInstanceOf(RetryableError);
  });

  it('wires listener to OrderCompletedEvent contract', async () => {
    await startOrderCompletedListener();

    expect(createPullWorkerMock).toHaveBeenCalledTimes(1);
    const [opts] = createPullWorkerMock.mock.calls[0];
    expect(opts.def).toBe(OrderCompletedEvent);
  });
});
