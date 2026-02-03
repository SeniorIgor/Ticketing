import mongoose from 'mongoose';
import request from 'supertest';

import { getAuthCookie } from '@org/test-utils';

import { createApp } from '../../app';
import { buildOrder, buildTicket } from '../../test/helpers';

const app = createApp();

describe('GET /api/v1/orders/:id', () => {
  it('rejects when not authenticated', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app).get(`/api/v1/orders/${id}`).expect(401);
  });

  it('rejects invalid id format', async () => {
    const cookie = getAuthCookie({ userId: 'user-1', email: 'test@test.com' });

    const res = await request(app).get('/api/v1/orders/not-an-id').set('Cookie', cookie).expect(400);

    expect(res.body).toMatchObject({
      code: 'VALIDATION',
      reason: 'ORDER_INVALID_ID',
    });
  });

  it('returns 404 when order does not exist', async () => {
    const cookie = getAuthCookie({ userId: 'user-1', email: 'test@test.com' });
    const id = new mongoose.Types.ObjectId().toHexString();

    await request(app).get(`/api/v1/orders/${id}`).set('Cookie', cookie).expect(404);
  });

  it('returns 403 when accessing order of another user', async () => {
    const cookie = getAuthCookie({ userId: 'user-2', email: 'test@test.com' });

    const ticket = await buildTicket();
    const order = await buildOrder({ userId: 'user-1', ticket });

    await request(app).get(`/api/v1/orders/${order.id}`).set('Cookie', cookie).expect(403);
  });

  it('returns the order for owner', async () => {
    const cookie = getAuthCookie({ userId: 'user-1', email: 'test@test.com' });

    const ticket = await buildTicket({ title: 'Concert', price: 50 });
    const order = await buildOrder({ userId: 'user-1', ticket });

    const res = await request(app).get(`/api/v1/orders/${order.id}`).set('Cookie', cookie).expect(200);

    expect(res.body).toMatchObject({
      id: order.id,
      ticket: expect.objectContaining({
        id: ticket.id,
        title: 'Concert',
        price: 50,
      }),
    });
  });
});
