import mongoose from 'mongoose';

import { expectDoc } from '../../test/helpers';
import { OrderStatuses } from '../../types';
import { Order } from '../order';

describe('payments: Order model', () => {
  it('build sets _id from id', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();

    const order = Order.build({
      id,
      userId: 'u1',
      status: OrderStatuses.Created,
      price: 10,
      version: 0,
    });

    await order.save();

    const saved = await Order.findById(id);
    expectDoc(saved);
    expect(saved.id).toBe(id);
  });

  it('applyCancelledFromEvent updates only when version is next', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();

    await Order.build({
      id,
      userId: 'u1',
      status: OrderStatuses.Created,
      price: 10,
      version: 0,
    }).save();

    const updated = await Order.applyCancelledFromEvent({ id, version: 1 });
    expect(updated).not.toBeNull();

    const saved = await Order.findById(id);
    expectDoc(saved);
    expect(saved.status).toBe(OrderStatuses.Cancelled);
    expect(saved.version).toBe(1);
  });

  it('applyCancelledFromEvent returns null on out-of-order version', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();

    await Order.build({
      id,
      userId: 'u1',
      status: OrderStatuses.Created,
      price: 10,
      version: 0,
    }).save();

    const updated = await Order.applyCancelledFromEvent({ id, version: 2 });
    expect(updated).toBeNull();
  });

  it('toJSON removes internal fields and exposes id', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();

    await Order.build({
      id,
      userId: 'u1',
      status: OrderStatuses.Created,
      price: 10,
      version: 0,
    }).save();

    const saved = await Order.findById(id);
    expectDoc(saved);

    const json = saved.toJSON();
    expect(json).toHaveProperty('id', id);
    expect(json).not.toHaveProperty('_id');
    expect(json).not.toHaveProperty('userId');
    expect(json).not.toHaveProperty('version');
  });
});
