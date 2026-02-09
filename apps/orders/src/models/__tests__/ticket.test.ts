import mongoose from 'mongoose';

import { buildOrder, buildTicket } from '../../test/helpers';
import { OrderStatus } from '../../types';
import { Ticket } from '../ticket';

describe('Orders service Ticket model', () => {
  it('build() uses incoming id as _id', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();

    const ticket = Ticket.build({ id, title: 'Concert', price: 50, version: 0 });
    await ticket.save();

    expect(ticket.id).toBe(id);
  });

  it('toJSON returns id equal to _id (string)', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();

    const ticket = Ticket.build({ id, title: 'A', price: 10, version: 0 });
    await ticket.save();

    const json = ticket.toJSON();

    expect(json.id).toBe(id);
    expect(json._id).toBeUndefined();
    expect(json.version).toBeUndefined();
    expect(json.createdAt).toBeUndefined();
    expect(json.updatedAt).toBeUndefined();
  });

  it('isReserved() returns false when no active order exists', async () => {
    const ticket = await buildTicket();
    expect(await ticket.isReserved()).toBe(false);
  });

  it('isReserved() returns true when an active order exists', async () => {
    const ticket = await buildTicket();

    await buildOrder({
      userId: 'user-1',
      status: OrderStatus.Created,
      ticket,
    });

    expect(await ticket.isReserved()).toBe(true);
  });

  it('isReserved() ignores cancelled orders', async () => {
    const ticket = await buildTicket();

    await buildOrder({
      userId: 'user-1',
      status: OrderStatus.Cancelled,
      ticket,
    });

    expect(await ticket.isReserved()).toBe(false);
  });
});
