import type { OrderCreatedData } from '@org/contracts';
import { OrderCreatedEvent, TicketStatuses, TicketUpdatedEvent } from '@org/contracts';
import { RetryableError } from '@org/nats';
import { makeMessageContextFactory } from '@org/test-utils';

import { Ticket } from '../../../models/ticket';
import { createPullWorkerMock, getLastHandler, publishEventMock } from '../../../test/mocks/nats';
import { startOrderCreatedListener } from '../order-created-listener';

const ctx = makeMessageContextFactory({ subject: 'orders.created' });

describe('tickets: OrderCreated listener', () => {
  it('reserves available ticket and publishes TicketUpdated', async () => {
    const ticket = await Ticket.create({ title: 'A', price: 10, userId: 'u1' }); // available by default

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
      throw new Error('Expected ticket');
    }

    expect(saved.status).toBe(TicketStatuses.Reserved);
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
      orderId: 'o1',
    });
  });

  it('is idempotent: same orderId does nothing and does not republish', async () => {
    const ticket = await Ticket.create({
      title: 'A',
      price: 10,
      userId: 'u1',
      status: TicketStatuses.Reserved,
      orderId: 'o1',
    });

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

  it('throws RetryableError if ticket is not available (reserved by other order)', async () => {
    const ticket = await Ticket.create({
      title: 'A',
      price: 10,
      userId: 'u1',
      status: TicketStatuses.Reserved,
      orderId: 'other',
    });

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

  it('throws RetryableError if ticket is sold', async () => {
    const ticket = await Ticket.create({
      title: 'A',
      price: 10,
      userId: 'u1',
      status: TicketStatuses.Sold,
      orderId: 'oOld',
    });

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

  it('wires listener to OrderCreatedEvent contract', async () => {
    await startOrderCreatedListener();
    expect(createPullWorkerMock).toHaveBeenCalledTimes(1);
    const [opts] = createPullWorkerMock.mock.calls[0];
    expect(opts.def).toBe(OrderCreatedEvent);
  });
});
