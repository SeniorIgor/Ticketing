import mongoose from 'mongoose';
import request from 'supertest';

import { OrderStatuses } from '@org/contracts';
import { getAuthCookie } from '@org/test-utils';

import { createApp } from '../../app';
import { buildOrderProjection } from '../../test/helpers';
import { stripeCreatePaymentIntentMock } from '../../test/mocks/stripe';

const app = createApp();

describe('POST /api/v1/payments/intents', () => {
  it('rejects when not authenticated', async () => {
    await request(app).post('/api/v1/payments/intents').send({ orderId: 'x' }).expect(401);
    expect(stripeCreatePaymentIntentMock).not.toHaveBeenCalled();
  });

  it('rejects invalid orderId format', async () => {
    const cookie = getAuthCookie({ userId: 'user-1', email: 'a@a.com' });

    const res = await request(app)
      .post('/api/v1/payments/intents')
      .set('Cookie', cookie)
      .send({ orderId: 'not-an-id' })
      .expect(400);

    expect(res.body).toMatchObject({
      code: 'VALIDATION',
      reason: 'PAYMENT_INTENT_INVALID_INPUT',
      details: expect.any(Array),
    });

    expect(stripeCreatePaymentIntentMock).not.toHaveBeenCalled();
  });

  it('returns 404 when order does not exist', async () => {
    const cookie = getAuthCookie({ userId: 'user-1', email: 'a@a.com' });
    const missingOrderId = new mongoose.Types.ObjectId().toHexString();

    await request(app)
      .post('/api/v1/payments/intents')
      .set('Cookie', cookie)
      .send({ orderId: missingOrderId })
      .expect(404);

    expect(stripeCreatePaymentIntentMock).not.toHaveBeenCalled();
  });

  it('rejects when order not owned by user', async () => {
    const order = await buildOrderProjection({ userId: 'owner' });
    const cookie = getAuthCookie({ userId: 'hacker', email: 'h@h.com' });

    await request(app).post('/api/v1/payments/intents').set('Cookie', cookie).send({ orderId: order.id }).expect(403);

    expect(stripeCreatePaymentIntentMock).not.toHaveBeenCalled();
  });

  it('rejects when order is cancelled', async () => {
    const order = await buildOrderProjection({ status: OrderStatuses.Cancelled });
    const cookie = getAuthCookie({ userId: order.userId, email: 'a@a.com' });

    await request(app).post('/api/v1/payments/intents').set('Cookie', cookie).send({ orderId: order.id }).expect(409);

    expect(stripeCreatePaymentIntentMock).not.toHaveBeenCalled();
  });

  it('rejects when order is already complete', async () => {
    const order = await buildOrderProjection({ status: OrderStatuses.Complete });
    const cookie = getAuthCookie({ userId: order.userId, email: 'a@a.com' });

    await request(app).post('/api/v1/payments/intents').set('Cookie', cookie).send({ orderId: order.id }).expect(409);

    expect(stripeCreatePaymentIntentMock).not.toHaveBeenCalled();
  });

  it('returns 409 when Stripe does not return clientSecret', async () => {
    stripeCreatePaymentIntentMock.mockResolvedValueOnce({
      id: 'pi_123',
      status: 'requires_payment_method',
      client_secret: null, // important
      amount: 100,
      currency: 'usd',
      metadata: { orderId: 'x', userId: 'y' },
    });

    const order = await buildOrderProjection({ price: 12.34, status: OrderStatuses.AwaitingPayment });
    const cookie = getAuthCookie({ userId: order.userId, email: 'a@a.com' });

    const res = await request(app)
      .post('/api/v1/payments/intents')
      .set('Cookie', cookie)
      .send({ orderId: order.id })
      .expect(409);

    expect(res.body).toMatchObject({
      code: 'BUSINESS_RULE',
      reason: 'PAYMENT_INTENT_NO_SECRET',
    });
  });

  it('creates intent and returns clientSecret', async () => {
    stripeCreatePaymentIntentMock.mockResolvedValueOnce({
      id: 'pi_123',
      status: 'requires_confirmation',
      client_secret: 'cs_test_123',
      amount: 1234,
      currency: 'usd',
      metadata: { orderId: 'x', userId: 'y' },
    });

    const order = await buildOrderProjection({ price: 12.34, status: OrderStatuses.AwaitingPayment });
    const cookie = getAuthCookie({ userId: order.userId, email: 'a@a.com' });

    const res = await request(app)
      .post('/api/v1/payments/intents')
      .set('Cookie', cookie)
      .send({ orderId: order.id })
      .expect(201);

    expect(stripeCreatePaymentIntentMock).toHaveBeenCalledTimes(1);
    expect(stripeCreatePaymentIntentMock).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: Math.round(order.price * 100),
        currency: 'usd',
        idempotencyKey: order.id,
        metadata: expect.objectContaining({ orderId: order.id, userId: order.userId }),
      }),
    );

    expect(res.body).toMatchObject({
      provider: 'stripe',
      providerId: 'pi_123',
      clientSecret: 'cs_test_123',
      status: 'requires_confirmation',
    });
  });
});
