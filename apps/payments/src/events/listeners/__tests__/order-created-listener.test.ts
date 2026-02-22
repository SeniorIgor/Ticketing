import mongoose from 'mongoose';

import type { OrderCreatedData } from '@org/contracts';
import { OrderCreatedEvent, OrderStatuses } from '@org/contracts';
import { makeMessageContextFactory } from '@org/test-utils';

import { Order } from '../../../models/order';
import { expectDoc } from '../../../test/helpers';
import { createPullWorkerMock, getLastHandler } from '../../../test/mocks/nats';
import { startOrderCreatedListener } from '../order-created-listener';

const ctx = makeMessageContextFactory({ subject: 'orders.created' });

describe('payments: OrderCreated listener', () => {
  it('creates order projection when missing', async () => {
    const orderId = new mongoose.Types.ObjectId().toHexString();

    await startOrderCreatedListener();

    const handler = getLastHandler<OrderCreatedData>();
    await handler(
      {
        id: orderId,
        userId: 'user-1',
        status: OrderStatuses.Created,
        expiresAt: new Date().toISOString(),
        ticket: { id: new mongoose.Types.ObjectId().toHexString(), price: 15 },
        version: 0,
      },
      ctx({ seq: 10 }),
    );

    const saved = await Order.findById(orderId);
    expectDoc(saved);

    expect(saved.userId).toBe('user-1');
    expect(saved.status).toBe(OrderStatuses.Created);
    expect(saved.price).toBe(15);
    expect(saved.version).toBe(0);
  });

  it('is idempotent: ignores if already exists', async () => {
    const orderId = new mongoose.Types.ObjectId().toHexString();

    await Order.build({
      id: orderId,
      userId: 'user-1',
      status: OrderStatuses.Created,
      price: 10,
      version: 0,
    }).save();

    await startOrderCreatedListener();

    const handler = getLastHandler<OrderCreatedData>();
    await handler(
      {
        id: orderId,
        userId: 'user-1',
        status: OrderStatuses.Created,
        expiresAt: new Date().toISOString(),
        ticket: { id: new mongoose.Types.ObjectId().toHexString(), price: 999 },
        version: 0,
      },
      ctx(),
    );

    const saved = await Order.findById(orderId);
    expectDoc(saved);
    expect(saved.price).toBe(10);
  });

  it('wires listener to OrderCreatedEvent contract', async () => {
    await startOrderCreatedListener();

    expect(createPullWorkerMock).toHaveBeenCalledTimes(1);
    const [opts] = createPullWorkerMock.mock.calls[0];
    expect(opts.def).toBe(OrderCreatedEvent);
  });
});
