import { buildTicket } from '../../test/helpers';
import { OrderStatuses } from '../../types';
import { Order } from '../order';

describe('Orders service Order model', () => {
  it('build() creates and saves an order', async () => {
    const ticket = await buildTicket();

    const order = Order.build({
      userId: 'user-1',
      status: OrderStatuses.Created,
      expiresAt: new Date(Date.now() + 60_000),
      ticket,
    });

    await order.save();

    expect(order.id).toBeDefined();
    expect(order.userId).toBe('user-1');
    expect(order.status).toBe(OrderStatuses.Created);
    expect(order.ticket.id).toBe(ticket.id);
  });

  it('defaults status to Created when not provided by caller (schema default)', async () => {
    const ticket = await buildTicket();

    const raw = new Order({
      userId: 'user-1',
      expiresAt: new Date(Date.now() + 60_000),
      ticket,
    });

    await raw.save();

    expect(raw.status).toBe(OrderStatuses.Created);
  });

  it('toJSON transforms _id -> id and hides internal fields', async () => {
    const ticket = await buildTicket();

    const order = Order.build({
      userId: 'user-1',
      status: OrderStatuses.Created,
      expiresAt: new Date(Date.now() + 60_000),
      ticket,
    });

    await order.save();

    const json = order.toJSON();

    expect(json.id).toBe(order.id);
    expect(json._id).toBeUndefined();
    expect(json.userId).toBeUndefined();
    expect(json.createdAt).toBeUndefined();
    expect(json.updatedAt).toBeUndefined();
    expect(json.version).toBeUndefined();
  });

  it('increments version on each save (optimistic concurrency)', async () => {
    const ticket = await buildTicket();

    const order = Order.build({
      userId: 'user-1',
      status: OrderStatuses.Created,
      expiresAt: new Date(Date.now() + 60_000),
      ticket,
    });

    await order.save();
    const v0 = order.version;

    order.set({ status: OrderStatuses.Cancelled });
    await order.save();

    expect(order.version).toBe(v0 + 1);
  });

  it('throws on stale version update (optimistic concurrency)', async () => {
    const ticket = await buildTicket();

    const order = Order.build({
      userId: 'user-1',
      status: OrderStatuses.Created,
      expiresAt: new Date(Date.now() + 60_000),
      ticket,
    });

    await order.save();

    const order1 = await Order.findById(order.id);
    const order2 = await Order.findById(order.id);

    if (!order1 || !order2) {
      throw new Error('Expected order to exist');
    }

    order1.set({ status: OrderStatuses.AwaitingPayment });
    await order1.save();

    order2.set({ status: OrderStatuses.Cancelled });
    await expect(order2.save()).rejects.toThrow();
  });
});
