import type { OrderCompletedData } from '@org/contracts';
import { OrderCompletedEvent, TicketStatuses, TicketUpdatedEvent } from '@org/contracts';
import { RetryableError } from '@org/nats';
import { makeMessageContextFactory } from '@org/test-utils';

import { Ticket } from '../../../models/ticket';
import { createPullWorkerMock, getLastHandler, publishEventMock } from '../../../test/mocks/nats';
import { startOrderCompletedListener } from '../order-completed-listener';

const ctx = makeMessageContextFactory({ subject: 'orders.completed' });

describe('tickets: OrderCompleted listener', () => {
  it('marks ticket as sold when reserved by this order and publishes TicketUpdated', async () => {
    const ticket = await Ticket.create({
      title: 'A',
      price: 10,
      userId: 'u1',
      status: TicketStatuses.Reserved,
      orderId: 'o1',
    });
    const beforeVersion = ticket.version;

    await startOrderCompletedListener();

    const handler = getLastHandler<OrderCompletedData>();
    await handler(
      { id: 'o1', userId: 'buyer', version: 1, ticket: { id: ticket.id } },
      ctx({ correlationId: 'req-1' }),
    );

    const saved = await Ticket.findById(ticket.id);
    if (!saved) {
      throw new Error('Expected ticket');
    }

    expect(saved.status).toBe(TicketStatuses.Sold);
    expect(saved.orderId).toBe('o1');
    expect(saved.version).toBe(beforeVersion + 1);

    expect(publishEventMock).toHaveBeenCalledTimes(1);
    const [def, , opts] = publishEventMock.mock.calls[0];
    expect(def).toBe(TicketUpdatedEvent);
    expect(opts).toEqual({ correlationId: 'req-1' });
  });

  it('idempotent: if already sold, does nothing', async () => {
    const ticket = await Ticket.create({
      title: 'A',
      price: 10,
      userId: 'u1',
      status: TicketStatuses.Sold,
      orderId: 'o1',
    });

    await startOrderCompletedListener();

    const handler = getLastHandler<OrderCompletedData>();
    await handler({ id: 'o1', userId: 'buyer', version: 1, ticket: { id: ticket.id } }, ctx());

    expect(publishEventMock).not.toHaveBeenCalled();
  });

  it('throws RetryableError if ticket reserved by different order', async () => {
    const ticket = await Ticket.create({
      title: 'A',
      price: 10,
      userId: 'u1',
      status: TicketStatuses.Reserved,
      orderId: 'other',
    });

    await startOrderCompletedListener();

    const handler = getLastHandler<OrderCompletedData>();
    await expect(
      handler({ id: 'o1', userId: 'buyer', version: 1, ticket: { id: ticket.id } }, ctx()),
    ).rejects.toBeInstanceOf(RetryableError);
  });

  it('throws RetryableError if ticket is available (out-of-order)', async () => {
    const ticket = await Ticket.create({ title: 'A', price: 10, userId: 'u1', status: TicketStatuses.Available });

    await startOrderCompletedListener();

    const handler = getLastHandler<OrderCompletedData>();
    await expect(
      handler({ id: 'o1', userId: 'buyer', version: 1, ticket: { id: ticket.id } }, ctx()),
    ).rejects.toBeInstanceOf(RetryableError);
  });

  it('wires listener to OrderCompletedEvent contract', async () => {
    await startOrderCompletedListener();
    expect(createPullWorkerMock).toHaveBeenCalledTimes(1);
    const [opts] = createPullWorkerMock.mock.calls[0];
    expect(opts.def).toBe(OrderCompletedEvent);
  });
});
