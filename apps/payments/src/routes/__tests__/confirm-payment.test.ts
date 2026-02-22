import request from 'supertest';

import { OrderStatuses, PaymentCreatedEvent, PaymentProviders } from '@org/contracts';
import { getAuthCookie } from '@org/test-utils';

import { createApp } from '../../app';
import { Payment } from '../../models/payment';
import { buildOrderProjection, buildPayment, expectDoc } from '../../test/helpers';
import { publishEventMock } from '../../test/mocks/nats';
import { stripeGetPaymentIntentMock } from '../../test/mocks/stripe';

const app = createApp();

describe('POST /api/v1/payments/confirm', () => {
  beforeAll(async () => {
    // Critical: autoIndex=false in tests, so create unique indexes explicitly.
    await Payment.createIndexes();
  });

  it('rejects when not authenticated', async () => {
    await request(app).post('/api/v1/payments/confirm').send({ orderId: 'x', paymentIntentId: 'pi_123' }).expect(401);

    expect(publishEventMock).not.toHaveBeenCalled();
  });

  it('rejects invalid body (zod)', async () => {
    const cookie = getAuthCookie({ userId: 'user-1', email: 'a@a.com' });

    const res = await request(app).post('/api/v1/payments/confirm').set('Cookie', cookie).send({}).expect(400);

    expect(res.body).toMatchObject({
      code: 'VALIDATION',
      reason: 'PAYMENT_CONFIRM_INVALID_INPUT',
      details: expect.any(Array),
    });
    expect(publishEventMock).not.toHaveBeenCalled();
  });

  it('returns 404 when order does not exist', async () => {
    const cookie = getAuthCookie({ userId: 'user-1', email: 'a@a.com' });

    await request(app)
      .post('/api/v1/payments/confirm')
      .set('Cookie', cookie)
      .send({ orderId: '507f1f77bcf86cd799439011', paymentIntentId: 'pi_123' })
      .expect(404);

    expect(publishEventMock).not.toHaveBeenCalled();
  });

  it('rejects when order not owned by user', async () => {
    const order = await buildOrderProjection({ userId: 'owner', status: OrderStatuses.AwaitingPayment });
    const cookie = getAuthCookie({ userId: 'hacker', email: 'h@h.com' });

    await request(app)
      .post('/api/v1/payments/confirm')
      .set('Cookie', cookie)
      .send({ orderId: order.id, paymentIntentId: 'pi_123' })
      .expect(403);

    expect(publishEventMock).not.toHaveBeenCalled();
  });

  it('rejects when order is cancelled', async () => {
    const order = await buildOrderProjection({ status: OrderStatuses.Cancelled });
    const cookie = getAuthCookie({ userId: order.userId, email: 'a@a.com' });

    await request(app)
      .post('/api/v1/payments/confirm')
      .set('Cookie', cookie)
      .send({ orderId: order.id, paymentIntentId: 'pi_123' })
      .expect(409);

    expect(publishEventMock).not.toHaveBeenCalled();
  });

  it('rejects when order is already complete', async () => {
    const order = await buildOrderProjection({ status: OrderStatuses.Complete });
    const cookie = getAuthCookie({ userId: order.userId, email: 'a@a.com' });

    await request(app)
      .post('/api/v1/payments/confirm')
      .set('Cookie', cookie)
      .send({ orderId: order.id, paymentIntentId: 'pi_123' })
      .expect(409);

    expect(publishEventMock).not.toHaveBeenCalled();
  });

  it('creates payment and publishes PaymentCreated (201)', async () => {
    const order = await buildOrderProjection({ price: 12.34, status: OrderStatuses.AwaitingPayment });
    const cookie = getAuthCookie({ userId: order.userId, email: 'a@a.com' });

    stripeGetPaymentIntentMock.mockResolvedValueOnce({
      id: 'pi_123',
      status: 'succeeded',
      amount: Math.round(order.price * 100),
      currency: 'usd',
      metadata: { orderId: order.id, userId: order.userId },
    });

    const res = await request(app)
      .post('/api/v1/payments/confirm')
      .set('Cookie', cookie)
      .set('x-request-id', 'req-1')
      .send({ orderId: order.id, paymentIntentId: 'pi_123' })
      .expect(201);

    const saved = await Payment.findById(res.body.id);
    expectDoc(saved);

    expect(saved.providerId).toBe('pi_123');
    expect(publishEventMock).toHaveBeenCalledTimes(1);
    expect(publishEventMock).toHaveBeenCalledWith(
      PaymentCreatedEvent,
      expect.objectContaining({
        id: saved.id,
        orderId: order.id,
        provider: PaymentProviders.Stripe,
        providerId: 'pi_123',
      }),
      expect.objectContaining({ correlationId: 'req-1' }),
    );
  });

  it('returns existing payment (200) and does not publish event again', async () => {
    const order = await buildOrderProjection({ price: 10, status: OrderStatuses.AwaitingPayment });
    const cookie = getAuthCookie({ userId: order.userId, email: 'a@a.com' });

    const existing = await buildPayment({ order, providerId: 'pi_existing' });

    const res = await request(app)
      .post('/api/v1/payments/confirm')
      .set('Cookie', cookie)
      .send({ orderId: order.id, paymentIntentId: 'pi_123' })
      .expect(200);

    expect(res.body).toMatchObject({ id: existing.id });
    expect(publishEventMock).not.toHaveBeenCalled();
    expect(stripeGetPaymentIntentMock).not.toHaveBeenCalled();
  });

  it('rejects when payment intent status is not succeeded', async () => {
    const order = await buildOrderProjection({ price: 10 });
    const cookie = getAuthCookie({ userId: order.userId, email: 'a@a.com' });

    stripeGetPaymentIntentMock.mockResolvedValueOnce({
      id: 'pi_123',
      status: 'requires_payment_method',
      amount: Math.round(order.price * 100),
      currency: 'usd',
      metadata: { orderId: order.id, userId: order.userId },
    });

    await request(app)
      .post('/api/v1/payments/confirm')
      .set('Cookie', cookie)
      .send({ orderId: order.id, paymentIntentId: 'pi_123' })
      .expect(409);

    expect(publishEventMock).not.toHaveBeenCalled();
  });

  it('CONCURRENCY: two parallel confirms create only one payment and publish once', async () => {
    const order = await buildOrderProjection({ price: 12.34, status: OrderStatuses.AwaitingPayment });
    const cookie = getAuthCookie({ userId: order.userId, email: 'a@a.com' });

    stripeGetPaymentIntentMock.mockImplementation(async (paymentIntentId: string) => {
      return {
        id: paymentIntentId,
        status: 'succeeded',
        amount: Math.round(order.price * 100),
        currency: 'usd',
        metadata: { orderId: order.id, userId: order.userId },
      };
    });

    const [r1, r2] = await Promise.all([
      request(app)
        .post('/api/v1/payments/confirm')
        .set('Cookie', cookie)
        .set('x-request-id', 'req-1')
        .send({ orderId: order.id, paymentIntentId: 'pi_1' }),
      request(app)
        .post('/api/v1/payments/confirm')
        .set('Cookie', cookie)
        .set('x-request-id', 'req-2')
        .send({ orderId: order.id, paymentIntentId: 'pi_2' }),
    ]);

    const statuses = [r1.status, r2.status].sort();
    expect(statuses).toEqual([200, 201]);

    const payments = await Payment.find({ order: order._id });
    expect(payments).toHaveLength(1);

    expect(publishEventMock).toHaveBeenCalledTimes(1);

    const ids = [r1.body.id, r2.body.id].filter(Boolean);
    expect(new Set(ids).size).toBe(1);
  });
});
