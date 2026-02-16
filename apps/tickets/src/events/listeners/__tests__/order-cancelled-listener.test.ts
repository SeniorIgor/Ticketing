import mongoose from 'mongoose';

import type { OrderCancelledData } from '@org/contracts';
import { OrderCancelledEvent, TicketStatuses, TicketUpdatedEvent } from '@org/contracts';
import { RetryableError } from '@org/nats';
import { makeMessageContextFactory } from '@org/test-utils';

import { Ticket } from '../../../models';
import { createPullWorkerMock, getLastHandler, publishEventMock } from '../../../test/mocks/nats';
import { startOrderCancelledListener } from '../order-cancelled-listener';

const ctx = makeMessageContextFactory({ subject: 'orders.cancelled' });

describe('tickets: OrderCancelled listener', () => {
  it('unreserves ticket when reserved by this order and publishes TicketUpdated', async () => {
    const ticket = await Ticket.create({
      title: 'A',
      price: 10,
      userId: 'u1',
      status: TicketStatuses.Reserved,
      orderId: 'o1',
    });

    await startOrderCancelledListener();

    const handler = getLastHandler<OrderCancelledData>();
    await handler(
      { id: 'o1', userId: 'buyer', ticket: { id: ticket.id }, version: 0 },
      ctx({ correlationId: 'req-888' }),
    );

    const saved = await Ticket.findById(ticket.id);
    if (!saved) {
      throw new Error('Expected ticket');
    }

    expect(saved.status).toBe(TicketStatuses.Available);
    expect(saved.orderId).toBeFalsy();

    expect(publishEventMock).toHaveBeenCalledTimes(1);
    const [def, , opts] = publishEventMock.mock.calls[0];
    expect(def).toBe(TicketUpdatedEvent);
    expect(opts).toEqual({ correlationId: 'req-888' });
  });

  it('idempotent: if already available, does nothing', async () => {
    const ticket = await Ticket.create({ title: 'A', price: 10, userId: 'u1', status: TicketStatuses.Available });

    await startOrderCancelledListener();

    const handler = getLastHandler<OrderCancelledData>();
    await handler({ id: 'o1', userId: 'buyer', ticket: { id: ticket.id }, version: 0 }, ctx());

    expect(publishEventMock).not.toHaveBeenCalled();
  });

  it('ignores cancel if already sold', async () => {
    const t = await Ticket.create({ title: 'A', price: 10, userId: 'u1', status: TicketStatuses.Sold, orderId: 'o1' });

    await startOrderCancelledListener();

    const handler = getLastHandler<OrderCancelledData>();
    await handler({ id: 'o1', userId: 'buyer', ticket: { id: t.id }, version: 0 }, ctx());

    expect(publishEventMock).not.toHaveBeenCalled();
  });

  it('throws RetryableError if ticket is reserved by different order', async () => {
    const ticket = await Ticket.create({
      title: 'A',
      price: 10,
      userId: 'u1',
      status: TicketStatuses.Reserved,
      orderId: 'other',
    });

    await startOrderCancelledListener();

    const handler = getLastHandler<OrderCancelledData>();
    await expect(
      handler({ id: 'o1', userId: 'buyer', ticket: { id: ticket.id }, version: 0 }, ctx()),
    ).rejects.toBeInstanceOf(RetryableError);
  });

  it('throws RetryableError if ticket does not exist', async () => {
    await startOrderCancelledListener();

    const missingTicketId = new mongoose.Types.ObjectId().toHexString();

    const handler = getLastHandler<OrderCancelledData>();
    await expect(
      handler({ id: 'o1', userId: 'buyer', ticket: { id: missingTicketId }, version: 0 }, ctx()),
    ).rejects.toBeInstanceOf(RetryableError);
  });

  it('wires listener to OrderCancelledEvent contract', async () => {
    await startOrderCancelledListener();
    expect(createPullWorkerMock).toHaveBeenCalledTimes(1);
    const [opts] = createPullWorkerMock.mock.calls[0];
    expect(opts.def).toBe(OrderCancelledEvent);
  });
});
