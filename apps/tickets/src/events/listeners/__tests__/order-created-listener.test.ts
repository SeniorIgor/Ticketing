import mongoose from 'mongoose';

import type { OrderCreatedData } from '@org/contracts';
import { OrderCreatedEvent, TicketUpdatedEvent } from '@org/contracts';
import { RetryableError } from '@org/nats';
import { makeMessageContextFactory } from '@org/test-utils';

import { Ticket } from '../../../models';
import { createPullWorkerMock, getLastHandler, publishEventMock } from '../../../test/mocks';
import { startOrderCreatedListener } from '../order-created-listener';

const ctx = makeMessageContextFactory({ subject: 'orders.created' });

describe('tickets: OrderCreated listener', () => {
  it('reserves ticket and publishes TicketUpdated', async () => {
    await Ticket.create({ title: 'A', price: 10, userId: 'u1', orderId: undefined });

    const ticket = await Ticket.findOne({ title: 'A' });
    expect(ticket).not.toBeNull();
    if (!ticket) {
      throw new Error('Expected ticket to exist');
    }

    await startOrderCreatedListener();

    const handler = getLastHandler<OrderCreatedData>();
    await handler(
      {
        id: 'o1',
        userId: 'buyer',
        status: 'created',
        expiresAt: new Date().toISOString(),
        ticket: { id: ticket.id, price: ticket.price },
        version: 0,
      },
      ctx({ correlationId: 'req-777' }),
    );

    const saved = await Ticket.findById(ticket.id);
    expect(saved).not.toBeNull();
    if (!saved) {
      throw new Error('Expected ticket to exist');
    }

    expect(saved.orderId).toBe('o1');

    expect(publishEventMock).toHaveBeenCalledTimes(1);
    const [def, data, opts] = publishEventMock.mock.calls[0];

    expect(def).toBe(TicketUpdatedEvent);
    expect(opts).toEqual({ correlationId: 'req-777' });

    expect(data).toMatchObject({
      id: saved.id,
      title: saved.title,
      price: saved.price,
      userId: saved.userId,
      version: saved.version,
    });
  });

  it('is idempotent: same orderId does nothing and does not republish', async () => {
    const ticket = await Ticket.create({ title: 'A', price: 10, userId: 'u1', orderId: 'o1' });

    await startOrderCreatedListener();

    const handler = getLastHandler<OrderCreatedData>();
    await handler(
      {
        id: 'o1',
        userId: 'buyer',
        status: 'created',
        expiresAt: new Date().toISOString(),
        ticket: { id: ticket.id, price: ticket.price },
        version: 0,
      },
      ctx(),
    );

    expect(publishEventMock).not.toHaveBeenCalled();
  });

  it('throws RetryableError if ticket is reserved by another order', async () => {
    const ticket = await Ticket.create({ title: 'A', price: 10, userId: 'u1', orderId: 'other' });

    await startOrderCreatedListener();

    const handler = getLastHandler<OrderCreatedData>();
    await expect(
      handler(
        {
          id: 'o1',
          userId: 'buyer',
          status: 'created',
          expiresAt: new Date().toISOString(),
          ticket: { id: ticket.id, price: ticket.price },
          version: 0,
        },
        ctx(),
      ),
    ).rejects.toBeInstanceOf(RetryableError);
  });

  it('throws RetryableError if ticket does not exist', async () => {
    await startOrderCreatedListener();

    const missingTicketId = new mongoose.Types.ObjectId().toHexString();

    const handler = getLastHandler<OrderCreatedData>();
    await expect(
      handler(
        {
          id: 'o1',
          userId: 'buyer',
          status: 'created',
          expiresAt: new Date().toISOString(),
          ticket: { id: missingTicketId, price: 10 },
          version: 0,
        },
        ctx(),
      ),
    ).rejects.toBeInstanceOf(RetryableError);
  });

  it('wires listener to OrderCreatedEvent contract', async () => {
    await startOrderCreatedListener();

    expect(createPullWorkerMock).toHaveBeenCalledTimes(1);

    const [opts] = createPullWorkerMock.mock.calls[0];

    expect(opts.def).toBe(OrderCreatedEvent);
    expect(opts.stream).toBeDefined();
  });
});
