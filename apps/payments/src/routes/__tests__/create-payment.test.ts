import request from 'supertest';

import { OrderStatuses, PaymentCreatedEvent } from '@org/contracts';
import { getAuthCookie } from '@org/test-utils';

import { createApp } from '../../app';
import { Payment } from '../../models/payment';
import { buildOrderProjection, buildPayment } from '../../test/helpers';
import { publishEventMock } from '../../test/mocks/nats';
import { stripeChargeMock } from '../../test/mocks/stripe';

const app = createApp();

describe('POST /api/v1/payments', () => {
  it('rejects when not authenticated', async () => {
    await request(app).post('/api/v1/payments').send({ orderId: 'x', token: 'tok' }).expect(401);
    expect(publishEventMock).not.toHaveBeenCalled();
  });

  it('returns 404 when order does not exist', async () => {
    const cookie = getAuthCookie({ userId: 'user-1', email: 'a@a.com' });

    await request(app)
      .post('/api/v1/payments')
      .set('Cookie', cookie)
      .send({ orderId: '507f1f77bcf86cd799439011', token: 'tok' })
      .expect(404);

    expect(publishEventMock).not.toHaveBeenCalled();
  });

  it('rejects when order not owned by user', async () => {
    const order = await buildOrderProjection({ userId: 'owner' });
    const cookie = getAuthCookie({ userId: 'hacker', email: 'h@h.com' });

    await request(app)
      .post('/api/v1/payments')
      .set('Cookie', cookie)
      .send({ orderId: order.id, token: 'tok' })
      .expect(403);

    expect(publishEventMock).not.toHaveBeenCalled();
  });

  it('rejects when order is cancelled', async () => {
    const order = await buildOrderProjection({ status: OrderStatuses.Cancelled });
    const cookie = getAuthCookie({ userId: order.userId, email: 'a@a.com' });

    await request(app)
      .post('/api/v1/payments')
      .set('Cookie', cookie)
      .send({ orderId: order.id, token: 'tok' })
      .expect(409);

    expect(publishEventMock).not.toHaveBeenCalled();
  });

  it('rejects when payment already exists for order', async () => {
    const order = await buildOrderProjection();
    await buildPayment({ order, providerId: 'ch_exists' });

    const cookie = getAuthCookie({ userId: order.userId, email: 'a@a.com' });

    await request(app)
      .post('/api/v1/payments')
      .set('Cookie', cookie)
      .send({ orderId: order.id, token: 'tok' })
      .expect(409);

    expect(stripeChargeMock).not.toHaveBeenCalled();
    expect(publishEventMock).not.toHaveBeenCalled();
  });

  it('creates payment, calls stripe, publishes PaymentCreated', async () => {
    stripeChargeMock.mockResolvedValueOnce({ id: 'ch_123' });

    const order = await buildOrderProjection({ price: 12.34, status: OrderStatuses.AwaitingPayment });
    const cookie = getAuthCookie({ userId: order.userId, email: 'a@a.com' });

    const res = await request(app)
      .post('/api/v1/payments')
      .set('Cookie', cookie)
      .set('x-request-id', 'req-1')
      .send({ orderId: order.id, token: 'tok_visa' })
      .expect(201);

    // saved in DB
    const payment = await Payment.findById(res.body.id);
    expect(payment).not.toBeNull();

    expect(stripeChargeMock).toHaveBeenCalledTimes(1);

    expect(publishEventMock).toHaveBeenCalledTimes(1);
    expect(publishEventMock).toHaveBeenCalledWith(
      PaymentCreatedEvent,
      expect.objectContaining({
        id: expect.any(String),
        orderId: order.id,
        stripeId: 'ch_123',
      }),
      expect.objectContaining({ correlationId: 'req-1' }),
    );
  });
});
