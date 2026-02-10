import mongoose from 'mongoose';

import type { TicketCreatedData } from '@org/contracts';
import { TicketCreatedEvent } from '@org/contracts';
import { makeMessageContextFactory } from '@org/test-utils';

import { Ticket } from '../../../models';
import { createPullWorkerMock, getLastHandler } from '../../../test/mocks';
import { startTicketCreatedListener } from '../ticket-created-listener';

const ctx = makeMessageContextFactory({ subject: 'tickets.created' });

describe('orders: TicketCreated listener', () => {
  it('creates ticket projection when missing', async () => {
    const ticketId = new mongoose.Types.ObjectId().toHexString();

    await startTicketCreatedListener();

    const handler = getLastHandler<TicketCreatedData>();
    await handler({ id: ticketId, title: 'Concert', price: 50, version: 0, userId: 'user-1' }, ctx({ seq: 10 }));

    const saved = await Ticket.findById(ticketId);
    expect(saved).not.toBeNull();
    if (!saved) {
      throw new Error('Expected ticket to exist');
    }

    expect(saved.title).toBe('Concert');
    expect(saved.price).toBe(50);
    expect(saved.version).toBe(0);
  });

  it('is idempotent: ignores if ticket already exists', async () => {
    const ticketId = new mongoose.Types.ObjectId().toHexString();

    await Ticket.create({ _id: ticketId, title: 'Old', price: 10, version: 0 });

    await startTicketCreatedListener();

    const handler = getLastHandler<TicketCreatedData>();
    await handler({ id: ticketId, title: 'New', price: 999, version: 0, userId: 'user-1' }, ctx());

    const saved = await Ticket.findById(ticketId);
    expect(saved).not.toBeNull();
    if (!saved) {
      throw new Error('Expected ticket to exist');
    }

    expect(saved.title).toBe('Old');
    expect(saved.price).toBe(10);
  });

  it('wires listener to TicketCreatedEvent contract', async () => {
    await startTicketCreatedListener();

    expect(createPullWorkerMock).toHaveBeenCalledTimes(1);

    const [opts] = createPullWorkerMock.mock.calls[0];
    expect(opts.def).toBe(TicketCreatedEvent);
  });
});
