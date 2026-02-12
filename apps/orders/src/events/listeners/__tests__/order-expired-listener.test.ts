import mongoose from 'mongoose';

import type { OrderExpiredData } from '@org/contracts';
import { OrderCancelledEvent, OrderExpiredEvent } from '@org/contracts';
import { RetryableError, Streams } from '@org/nats';
import { makeMessageContextFactory } from '@org/test-utils';

import { Order } from '../../../models';
import { buildOrder, buildTicket } from '../../../test/helpers';
import { createPullWorkerMock, getLastHandler, publishEventMock } from '../../../test/mocks';
import { OrderStatus } from '../../../types';
import { startOrderExpiredListener } from '../order-expired-listener';

const ctx = makeMessageContextFactory({ subject: 'expiration.order-expired' });

describe('orders: OrderExpired listener', () => {
  it('cancels active order (Created) and publishes OrderCancelled', async () => {
    const ticket = await buildTicket();
    const order = await buildOrder({ userId: 'user-1', ticket, status: OrderStatus.Created });

    await startOrderExpiredListener();

    const handler = getLastHandler<OrderExpiredData>();

    await handler({ orderId: order.id }, ctx({ correlationId: 'req-999', seq: 10 }));

    const saved = await Order.findById(order.id);
    expect(saved).not.toBeNull();
    if (!saved) {
      throw new Error('Expected order to exist');
    }

    expect(saved.status).toBe(OrderStatus.Cancelled);

    expect(publishEventMock).toHaveBeenCalledTimes(1);

    const [def, data, opts] = publishEventMock.mock.calls[0];

    expect(def).toBe(OrderCancelledEvent);
    expect(opts).toEqual({ correlationId: 'req-999' });

    expect(data).toMatchObject({
      id: saved.id,
      userId: saved.userId,
      version: saved.version,
      ticket: { id: saved.ticket.toString() },
    });
  });

  it('cancels active order (AwaitingPayment) and publishes OrderCancelled', async () => {
    const ticket = await buildTicket();
    const order = await buildOrder({ userId: 'user-1', ticket, status: OrderStatus.AwaitingPayment });

    await startOrderExpiredListener();

    const handler = getLastHandler<OrderExpiredData>();
    await handler({ orderId: order.id }, ctx({ correlationId: 'req-123' }));

    const saved = await Order.findById(order.id);
    expect(saved).not.toBeNull();
    if (!saved) {
      throw new Error('Expected order to exist');
    }

    expect(saved.status).toBe(OrderStatus.Cancelled);
    expect(publishEventMock).toHaveBeenCalledTimes(1);
  });

  it('is idempotent: if order already Cancelled, does nothing and does not publish', async () => {
    const ticket = await buildTicket();
    const order = await buildOrder({ userId: 'user-1', ticket, status: OrderStatus.Cancelled });

    await startOrderExpiredListener();

    const handler = getLastHandler<OrderExpiredData>();
    await handler({ orderId: order.id }, ctx());

    const saved = await Order.findById(order.id);
    expect(saved).not.toBeNull();
    if (!saved) {
      throw new Error('Expected order to exist');
    }

    expect(saved.status).toBe(OrderStatus.Cancelled);
    expect(publishEventMock).not.toHaveBeenCalled();
  });

  it('is idempotent: if order already Complete, does nothing and does not publish', async () => {
    const ticket = await buildTicket();
    const order = await buildOrder({ userId: 'user-1', ticket, status: OrderStatus.Complete });

    await startOrderExpiredListener();

    const handler = getLastHandler<OrderExpiredData>();
    await handler({ orderId: order.id }, ctx());

    const saved = await Order.findById(order.id);
    expect(saved).not.toBeNull();
    if (!saved) {
      throw new Error('Expected order to exist');
    }

    expect(saved.status).toBe(OrderStatus.Complete);
    expect(publishEventMock).not.toHaveBeenCalled();
  });

  it('throws RetryableError if order does not exist', async () => {
    await startOrderExpiredListener();

    const missingOrderId = new mongoose.Types.ObjectId().toHexString();

    const handler = getLastHandler<OrderExpiredData>();
    await expect(handler({ orderId: missingOrderId }, ctx())).rejects.toBeInstanceOf(RetryableError);

    expect(publishEventMock).not.toHaveBeenCalled();
  });

  it('wires listener to OrderExpiredEvent contract', async () => {
    await startOrderExpiredListener();

    expect(createPullWorkerMock).toHaveBeenCalledTimes(1);

    const [opts] = createPullWorkerMock.mock.calls[0];
    expect(opts.def).toBe(OrderExpiredEvent);
    expect(opts.stream).toBe(Streams.Expiration);
  });
});
