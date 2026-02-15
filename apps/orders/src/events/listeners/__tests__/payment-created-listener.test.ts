import mongoose from 'mongoose';

import type { PaymentCreatedData } from '@org/contracts';
import { OrderCompletedEvent, OrderStatuses, PaymentCreatedEvent } from '@org/contracts';
import { RetryableError, Streams } from '@org/nats';
import { makeMessageContextFactory } from '@org/test-utils';

import { Order } from '../../../models';
import { buildOrder, buildTicket } from '../../../test/helpers';
import { createPullWorkerMock, getLastHandler, publishEventMock } from '../../../test/mocks';
import { startPaymentCreatedListener } from '../payment-created-listener';

const ctx = makeMessageContextFactory({ subject: 'payments.created' });

describe('orders: PaymentCreated listener', () => {
  it('marks order Complete (from Created), increments version, and publishes OrderCompleted', async () => {
    const ticket = await buildTicket();
    const order = await buildOrder({ userId: 'user-1', ticket, status: OrderStatuses.Created });

    const beforeVersion = order.version;

    await startPaymentCreatedListener();

    const handler = getLastHandler<PaymentCreatedData>();
    await handler({ id: 'p1', orderId: order.id, stripeId: 'ch_1' }, ctx({ correlationId: 'req-1', seq: 10 }));

    const saved = await Order.findById(order.id);
    if (!saved) {
      throw new Error('Expected order to exist');
    }

    expect(saved.status).toBe(OrderStatuses.Complete);
    expect(saved.version).toBe(beforeVersion + 1);

    expect(publishEventMock).toHaveBeenCalledTimes(1);
    const [def, data, opts] = publishEventMock.mock.calls[0];

    expect(def).toBe(OrderCompletedEvent);
    expect(opts).toEqual({ correlationId: 'req-1' });
    expect(data).toMatchObject({ id: saved.id, userId: saved.userId, version: saved.version });
  });

  it('is idempotent: ignores if order already Complete', async () => {
    const ticket = await buildTicket();
    const order = await buildOrder({ userId: 'user-1', ticket, status: OrderStatuses.Complete });

    await startPaymentCreatedListener();

    const handler = getLastHandler<PaymentCreatedData>();
    await handler({ id: 'p1', orderId: order.id, stripeId: 'ch_1' }, ctx({ seq: 1 }));

    // no extra events
    expect(publishEventMock).not.toHaveBeenCalled();
  });

  it('ignores if order already Cancelled (payment too late)', async () => {
    const ticket = await buildTicket();
    const order = await buildOrder({ userId: 'user-1', ticket, status: OrderStatuses.Cancelled });

    await startPaymentCreatedListener();

    const handler = getLastHandler<PaymentCreatedData>();
    await handler({ id: 'p1', orderId: order.id, stripeId: 'ch_1' }, ctx({ seq: 1 }));

    expect(publishEventMock).not.toHaveBeenCalled();
  });

  it('throws RetryableError if order does not exist', async () => {
    await startPaymentCreatedListener();

    const missingOrderId = new mongoose.Types.ObjectId().toHexString();

    const handler = getLastHandler<PaymentCreatedData>();
    await expect(handler({ id: 'p1', orderId: missingOrderId, stripeId: 'ch_1' }, ctx())).rejects.toBeInstanceOf(
      RetryableError,
    );

    expect(publishEventMock).not.toHaveBeenCalled();
  });

  it('wires listener to PaymentCreatedEvent contract and PAYMENTS stream', async () => {
    await startPaymentCreatedListener();

    expect(createPullWorkerMock).toHaveBeenCalledTimes(1);
    const [opts] = createPullWorkerMock.mock.calls[0];

    expect(opts.def).toBe(PaymentCreatedEvent);
    expect(opts.stream).toBe(Streams.Payments);
  });
});
