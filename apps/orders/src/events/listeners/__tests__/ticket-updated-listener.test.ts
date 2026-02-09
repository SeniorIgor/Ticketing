import mongoose from 'mongoose';

import type { TicketUpdatedData } from '@org/contracts';
import { TicketUpdatedEvent } from '@org/contracts';
import { RetryableError } from '@org/nats';
import { makeMessageContextFactory } from '@org/test-utils';

import { Ticket } from '../../../models';
import { createPullWorkerMock, getLastHandler } from '../../../test/mocks';
import { startTicketUpdatedListener } from '../ticket-updated-listener';

const ctx = makeMessageContextFactory({ subject: 'tickets.updated' });

describe('orders: TicketUpdated listener', () => {
  it('applies update when version is next (v0 -> v1)', async () => {
    const ticketId = new mongoose.Types.ObjectId().toHexString();

    await Ticket.create({ _id: ticketId, title: 'A', price: 10, version: 0 });

    await startTicketUpdatedListener();

    const handler = getLastHandler<TicketUpdatedData>();
    await handler({ id: ticketId, title: 'B', price: 20, version: 1, userId: 'user-1' }, ctx({ seq: 20 }));

    const saved = await Ticket.findById(ticketId);
    expect(saved).not.toBeNull();
    if (!saved) {
      throw new Error('Expected ticket to exist');
    }

    expect(saved.title).toBe('B');
    expect(saved.price).toBe(20);
    expect(saved.version).toBe(1);
  });

  it('ignores duplicates (already applied version)', async () => {
    const ticketId = new mongoose.Types.ObjectId().toHexString();

    await Ticket.create({ _id: ticketId, title: 'B', price: 20, version: 1 });

    await startTicketUpdatedListener();

    const handler = getLastHandler<TicketUpdatedData>();
    await expect(
      handler({ id: ticketId, title: 'B', price: 20, version: 1, userId: 'user-1' }, ctx({ delivered: 2 })),
    ).resolves.toBeUndefined();
  });

  it('throws RetryableError on out-of-order update', async () => {
    const ticketId = new mongoose.Types.ObjectId().toHexString();

    await startTicketUpdatedListener();

    const handler = getLastHandler<TicketUpdatedData>();
    await expect(
      handler({ id: ticketId, title: 'B', price: 20, version: 1, userId: 'user-1' }, ctx()),
    ).rejects.toBeInstanceOf(RetryableError);
  });

  it('throws RetryableError when there is a version gap (stored v1, incoming v3)', async () => {
    const ticketId = new mongoose.Types.ObjectId().toHexString();

    await Ticket.create({ _id: ticketId, title: 'A', price: 10, version: 1 });

    await startTicketUpdatedListener();

    const handler = getLastHandler<TicketUpdatedData>();

    await expect(
      handler({ id: ticketId, title: 'C', price: 30, version: 3, userId: 'user-1' }, ctx()),
    ).rejects.toBeInstanceOf(RetryableError);

    const saved = await Ticket.findById(ticketId);
    expect(saved).not.toBeNull();
    if (!saved) {
      throw new Error('Expected ticket to exist');
    }

    expect(saved.version).toBe(1);
    expect(saved.title).toBe('A');
    expect(saved.price).toBe(10);
  });

  it('wires listener to TicketUpdatedEvent contract', async () => {
    await startTicketUpdatedListener();

    expect(createPullWorkerMock).toHaveBeenCalledTimes(1);

    const [opts] = createPullWorkerMock.mock.calls[0];
    expect(opts.def).toBe(TicketUpdatedEvent);
  });
});
