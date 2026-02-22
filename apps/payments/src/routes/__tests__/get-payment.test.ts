import request from 'supertest';

import { getAuthCookie } from '@org/test-utils';

import { createApp } from '../../app';
import { Payment } from '../../models/payment';
import { buildOrderProjection, buildPayment } from '../../test/helpers';

const app = createApp();

describe('GET /api/v1/payments/:id', () => {
  it('rejects when not authenticated', async () => {
    const id = '507f1f77bcf86cd799439011';
    await request(app).get(`/api/v1/payments/${id}`).expect(401);
  });

  it('rejects invalid id format', async () => {
    const cookie = getAuthCookie({ userId: 'user-1', email: 'a@a.com' });

    const res = await request(app).get('/api/v1/payments/not-an-id').set('Cookie', cookie).expect(400);

    expect(res.body).toMatchObject({
      code: 'VALIDATION',
      reason: 'PAYMENT_INVALID_ID',
      details: [{ fieldName: 'id', message: 'Invalid payment id' }],
    });
  });

  it('returns 404 when payment does not exist', async () => {
    const cookie = getAuthCookie({ userId: 'user-1', email: 'a@a.com' });

    await request(app).get('/api/v1/payments/507f1f77bcf86cd799439011').set('Cookie', cookie).expect(404);
  });

  it('returns 403 when payment belongs to another user', async () => {
    const order = await buildOrderProjection({ userId: 'owner' });
    const payment = await buildPayment({ order, userId: 'owner', providerId: 'ch_1' });

    const cookie = getAuthCookie({ userId: 'hacker', email: 'h@h.com' });

    await request(app).get(`/api/v1/payments/${payment.id}`).set('Cookie', cookie).expect(403);
  });

  it('returns the payment for owner', async () => {
    const order = await buildOrderProjection({ userId: 'user-1', price: 12.34 });
    const payment = await buildPayment({ order, providerId: 'ch_123', userId: 'user-1' });

    const cookie = getAuthCookie({ userId: 'user-1', email: 'a@a.com' });

    const res = await request(app).get(`/api/v1/payments/${payment.id}`).set('Cookie', cookie).expect(200);

    const saved = await Payment.findById(payment.id);
    if (!saved) {
      throw new Error('Expected payment to exist');
    }

    expect(res.body.id).toBe(saved.id);
    expect(res.body._id).toBeUndefined();
    expect(res.body.userId).toBeUndefined();
  });

  it('includes populated order', async () => {
    const order = await buildOrderProjection({ userId: 'user-1', price: 10 });
    const payment = await buildPayment({ order, userId: 'user-1', providerId: 'ch_1' });

    const cookie = getAuthCookie({ userId: 'user-1', email: 'a@a.com' });

    const res = await request(app).get(`/api/v1/payments/${payment.id}`).set('Cookie', cookie).expect(200);

    expect(res.body.order).toBeDefined();
  });
});
