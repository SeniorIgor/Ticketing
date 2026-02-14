import mongoose from 'mongoose';

import type { OrderCancelledData } from '@org/contracts';
import { OrderCancelledEvent } from '@org/contracts';
import { RetryableError } from '@org/nats';
import { makeMessageContextFactory } from '@org/test-utils';

import { Order } from '../../../models/order';
import { expectDoc } from '../../../test/helpers';
import { createPullWorkerMock, getLastHandler } from '../../../test/mocks';
import { OrderStatuses } from '../../../types';
import { startOrderCancelledListener } from '../order-cancelled-listener';

const ctx = makeMessageContextFactory({ subject: 'orders.cancelled' });

describe('payments: OrderCancelled listener', () => {
  it('applies cancel when version is next', async () => {
    const orderId = new mongoose.Types.ObjectId().toHexString();

    await Order.build({
      id: orderId,
      userId: 'user-1',
      status: OrderStatuses.Created,
      price: 10,
      version: 0,
    }).save();

    await startOrderCancelledListener();

    const handler = getLastHandler<OrderCancelledData>();
    await handler(
      {
        id: orderId,
        userId: 'user-1',
        ticket: { id: new mongoose.Types.ObjectId().toHexString() },
        version: 1,
      },
      ctx({ seq: 5 }),
    );

    const saved = await Order.findById(orderId);
    expectDoc(saved);

    expect(saved.status).toBe(OrderStatuses.Cancelled);
    expect(saved.version).toBe(1);
  });

  it('ignores duplicates (already applied same version)', async () => {
    const orderId = new mongoose.Types.ObjectId().toHexString();

    await Order.build({
      id: orderId,
      userId: 'user-1',
      status: OrderStatuses.Cancelled,
      price: 10,
      version: 1,
    }).save();

    await startOrderCancelledListener();

    const handler = getLastHandler<OrderCancelledData>();
    await expect(
      handler(
        {
          id: orderId,
          userId: 'user-1',
          ticket: { id: new mongoose.Types.ObjectId().toHexString() },
          version: 1,
        },
        ctx(),
      ),
    ).resolves.toBeUndefined();
  });

  it('throws RetryableError on out-of-order version', async () => {
    const orderId = new mongoose.Types.ObjectId().toHexString();

    await Order.build({
      id: orderId,
      userId: 'user-1',
      status: OrderStatuses.Created,
      price: 10,
      version: 0,
    }).save();

    await startOrderCancelledListener();

    const handler = getLastHandler<OrderCancelledData>();
    await expect(
      handler(
        {
          id: orderId,
          userId: 'user-1',
          ticket: { id: new mongoose.Types.ObjectId().toHexString() },
          version: 2,
        },
        ctx(),
      ),
    ).rejects.toBeInstanceOf(RetryableError);
  });

  it('wires listener to OrderCancelledEvent contract', async () => {
    await startOrderCancelledListener();

    expect(createPullWorkerMock).toHaveBeenCalledTimes(1);
    const [opts] = createPullWorkerMock.mock.calls[0];
    expect(opts.def).toBe(OrderCancelledEvent);
  });
});
