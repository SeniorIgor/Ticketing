import mongoose from 'mongoose';

import { TicketStatuses } from '@org/contracts';

import { buildTicket } from '../../test/helpers/build-ticket';
import { Ticket } from '../ticket';

describe('Tickets service Ticket model', () => {
  it('build() creates and saves a ticket', async () => {
    const ticket = Ticket.build({
      title: 'Concert',
      price: 50,
      userId: 'user-1',
    });

    await ticket.save();

    expect(ticket.title).toBe('Concert');
    expect(ticket.price).toBe(50);
    expect(ticket.userId).toBe('user-1');
    expect(ticket.status).toBe(TicketStatuses.Available);
    expect(ticket.id).toBeDefined();
  });

  it('isReserved() returns false when status is Available', async () => {
    const ticket = await buildTicket({ status: TicketStatuses.Available, orderId: undefined });
    expect(ticket.isReserved()).toBe(false);
  });

  it('isReserved() returns true when status is Reserved', async () => {
    const ticket = await buildTicket({
      status: TicketStatuses.Reserved,
      orderId: new mongoose.Types.ObjectId().toHexString(),
    });
    expect(ticket.isReserved()).toBe(true);
  });

  it('isReserved() returns true when status is Sold', async () => {
    const ticket = await buildTicket({
      status: TicketStatuses.Sold,
      orderId: new mongoose.Types.ObjectId().toHexString(),
    });
    expect(ticket.isReserved()).toBe(true);
  });

  it('toJSON transforms _id -> id and hides internal fields', async () => {
    const ticket = await buildTicket({ title: 'A', price: 10, userId: 'user-1' });

    const json = ticket.toJSON();

    expect(json).toMatchObject({
      id: expect.any(String),
      title: 'A',
      price: 10,
      status: TicketStatuses.Available,
    });

    expect(json._id).toBeUndefined();
    expect(json.userId).toBeUndefined();
    expect(json.createdAt).toBeUndefined();
    expect(json.updatedAt).toBeUndefined();
    expect(json.version).toBeUndefined();
  });

  it('increments version on each save (optimistic concurrency)', async () => {
    const ticket = await buildTicket({ title: 'A', price: 10 });

    const v0 = ticket.version;

    ticket.set({ price: 20 });
    await ticket.save();

    expect(ticket.version).toBe(v0 + 1);
  });

  it('throws on stale version update (optimistic concurrency)', async () => {
    const ticket = await buildTicket({ title: 'A', price: 10 });

    const instance1 = await Ticket.findById(ticket.id);
    const instance2 = await Ticket.findById(ticket.id);

    if (!instance1 || !instance2) {
      throw new Error('Expected ticket to exist');
    }

    instance1.set({ price: 11 });
    await instance1.save();

    instance2.set({ price: 12 });

    await expect(instance2.save()).rejects.toThrow();
  });
});
