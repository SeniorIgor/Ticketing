import mongoose from 'mongoose';
import request from 'supertest';

import { OrderCancelledEvent, OrderStatuses } from '@org/contracts';
import { getAuthCookie } from '@org/test-utils';

import { createApp } from '../../app';
import { Order } from '../../models';
import { buildOrder, buildTicket } from '../../test/helpers';
import { publishEventMock } from '../../test/mocks';

const app = createApp();

describe('DELETE /api/v1/orders/:id', () => {
  it('rejects when not authenticated', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();

    await request(app).delete(`/api/v1/orders/${id}`).expect(401);

    expect(publishEventMock).not.toHaveBeenCalled();
  });

  it('rejects invalid id format', async () => {
    const cookie = getAuthCookie({ userId: 'user-1', email: 'test@test.com' });

    await request(app).delete('/api/v1/orders/not-an-id').set('Cookie', cookie).expect(400);

    expect(publishEventMock).not.toHaveBeenCalled();
  });

  it('returns 404 when order does not exist', async () => {
    const cookie = getAuthCookie({ userId: 'user-1', email: 'test@test.com' });
    const id = new mongoose.Types.ObjectId().toHexString();

    await request(app).delete(`/api/v1/orders/${id}`).set('Cookie', cookie).expect(404);

    expect(publishEventMock).not.toHaveBeenCalled();
  });

  it('returns 403 when cancelling another user order and does not change it', async () => {
    const cookie = getAuthCookie({ userId: 'user-2', email: 'test@test.com' });

    const ticket = await buildTicket();
    const order = await buildOrder({ userId: 'user-1', ticket });

    await request(app).delete(`/api/v1/orders/${order.id}`).set('Cookie', cookie).expect(403);

    const saved = await Order.findById(order.id);
    if (!saved) {
      throw new Error('Expected order to exist');
    }

    expect(saved.status).toBe(OrderStatuses.Created);
    expect(publishEventMock).not.toHaveBeenCalled();
  });

  it('cancels order for owner, increments version, and publishes OrderCancelled', async () => {
    const cookie = getAuthCookie({ userId: 'user-1', email: 'test@test.com' });

    const ticket = await buildTicket({ title: 'Concert', price: 50 });
    const order = await buildOrder({ userId: 'user-1', ticket });

    const before = order.version;

    await request(app).delete(`/api/v1/orders/${order.id}`).set('Cookie', cookie).expect(204);

    const saved = await Order.findById(order.id);
    if (!saved) {
      throw new Error('Expected order to exist');
    }

    expect(saved.status).toBe(OrderStatuses.Cancelled);
    expect(saved.version).toBe(before + 1);

    expect(publishEventMock).toHaveBeenCalledTimes(1);
    const [def, data, opts] = publishEventMock.mock.calls[0];

    expect(def).toBe(OrderCancelledEvent);

    expect(data).toMatchObject({
      id: saved.id,
      userId: saved.userId,
      ticket: { id: saved.ticket.toString() },
      version: saved.version,
    });

    expect(opts).toEqual({ correlationId: undefined });
  });

  it('passes correlationId from x-request-id header when present', async () => {
    const cookie = getAuthCookie({ userId: 'user-1', email: 'test@test.com' });

    const ticket = await buildTicket();
    const order = await buildOrder({ userId: 'user-1', ticket });

    await request(app)
      .delete(`/api/v1/orders/${order.id}`)
      .set('Cookie', cookie)
      .set('x-request-id', 'req-999')
      .expect(204);

    expect(publishEventMock).toHaveBeenCalledTimes(1);

    const [, , opts] = publishEventMock.mock.calls[0];
    expect(opts).toEqual({ correlationId: 'req-999' });
  });
});
