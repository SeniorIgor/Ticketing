import request from 'supertest';

import { getAuthCookie } from '@org/test-utils';

import { createApp } from '../../app';
import { Order } from '../../models';
import { buildOrder, buildTicket } from '../../test/helpers';
import { OrderStatus } from '../../types';

const app = createApp();

describe('POST /api/v1/orders', () => {
  it('rejects when not authenticated', async () => {
    const ticket = await buildTicket();
    await request(app).post('/api/v1/orders').send({ ticketId: ticket._id }).expect(401);
  });

  it('rejects invalid input', async () => {
    const cookie = getAuthCookie({ userId: 'user-1', email: 'test@test.com' });

    const res = await request(app)
      .post('/api/v1/orders')
      .set('Cookie', cookie)
      .send({ ticketId: 'not-an-id' })
      .expect(400);

    expect(res.body).toMatchObject({
      code: 'VALIDATION',
      reason: 'ORDER_INVALID_INPUT',
      details: expect.any(Array),
    });
  });

  it('returns 404 when ticket does not exist', async () => {
    const cookie = getAuthCookie({ userId: 'user-1', email: 'test@test.com' });

    await request(app)
      .post('/api/v1/orders')
      .set('Cookie', cookie)
      .send({ ticketId: '507f1f77bcf86cd799439011' })
      .expect(404);
  });

  it('rejects when ticket is already reserved', async () => {
    const cookie = getAuthCookie({ userId: 'user-2', email: 'test@test.com' });
    const ticket = await buildTicket();

    await buildOrder({ userId: 'user-1', ticket, status: OrderStatus.Created });

    await request(app).post('/api/v1/orders').set('Cookie', cookie).send({ ticketId: ticket._id }).expect(409);
  });

  it('creates an order and returns 201', async () => {
    const cookie = getAuthCookie({ userId: 'user-1', email: 'test@test.com' });
    const ticket = await buildTicket({ price: 99, title: 'VIP' });

    const res = await request(app)
      .post('/api/v1/orders')
      .set('Cookie', cookie)
      .send({ ticketId: ticket._id })
      .expect(201);

    expect(res.body).toMatchObject({
      id: expect.any(String),
      status: OrderStatus.Created,
      expiresAt: expect.any(String),
      ticket: {
        id: ticket._id,
        title: 'VIP',
        price: 99,
      },
    });

    const saved = await Order.findById(res.body.id);
    if (!saved) {
      throw new Error('Expected order to exist');
    }

    expect(saved.userId).toBe('user-1');
    expect(saved.status).toBe(OrderStatus.Created);
    expect(saved.ticketId).toBe(ticket._id);
  });
});
