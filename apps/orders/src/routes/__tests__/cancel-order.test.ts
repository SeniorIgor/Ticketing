import mongoose from 'mongoose';
import request from 'supertest';

import { getAuthCookie } from '@org/test-utils';

import { createApp } from '../../app';
import { Order } from '../../models';
import { buildOrder, buildTicket } from '../../test/helpers';
import { OrderStatus } from '../../types';

const app = createApp();

describe('DELETE /api/v1/orders/:id', () => {
  it('rejects when not authenticated', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app).delete(`/api/v1/orders/${id}`).expect(401);
  });

  it('rejects invalid id format', async () => {
    const cookie = getAuthCookie({ userId: 'user-1', email: 'test@test.com' });

    await request(app).delete('/api/v1/orders/not-an-id').set('Cookie', cookie).expect(400);
  });

  it('returns 404 when order does not exist', async () => {
    const cookie = getAuthCookie({ userId: 'user-1', email: 'test@test.com' });
    const id = new mongoose.Types.ObjectId().toHexString();

    await request(app).delete(`/api/v1/orders/${id}`).set('Cookie', cookie).expect(404);
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
    expect(saved.status).toBe(OrderStatus.Created);
  });

  it('cancels order for owner (sets status to Cancelled)', async () => {
    const cookie = getAuthCookie({ userId: 'user-1', email: 'test@test.com' });

    const ticket = await buildTicket();
    const order = await buildOrder({ userId: 'user-1', ticket });

    await request(app).delete(`/api/v1/orders/${order.id}`).set('Cookie', cookie).expect(204);

    const saved = await Order.findById(order.id);
    if (!saved) {
      throw new Error('Expected order to exist');
    }
    expect(saved.status).toBe(OrderStatus.Cancelled);
  });
});
