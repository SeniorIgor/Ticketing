import request from 'supertest';

import { OrderCreatedEvent, OrderStatuses } from '@org/contracts';
import { getAuthCookie } from '@org/test-utils';

import { createApp } from '../../app';
import { Order } from '../../models';
import { buildOrder, buildTicket } from '../../test/helpers';
import { publishEventMock } from '../../test/mocks';

const app = createApp();

describe('POST /api/v1/orders', () => {
  it('rejects when not authenticated', async () => {
    const ticket = await buildTicket();

    await request(app).post('/api/v1/orders').send({ ticketId: ticket.id }).expect(401);

    expect(publishEventMock).not.toHaveBeenCalled();
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

    expect(publishEventMock).not.toHaveBeenCalled();
  });

  it('returns 404 when ticket does not exist', async () => {
    const cookie = getAuthCookie({ userId: 'user-1', email: 'test@test.com' });

    await request(app)
      .post('/api/v1/orders')
      .set('Cookie', cookie)
      .send({ ticketId: '507f1f77bcf86cd799439011' })
      .expect(404);

    expect(publishEventMock).not.toHaveBeenCalled();
  });

  it('rejects when ticket is already reserved', async () => {
    const cookie = getAuthCookie({ userId: 'user-2', email: 'test@test.com' });
    const ticket = await buildTicket();

    await buildOrder({ userId: 'user-1', ticket, status: OrderStatuses.Created });

    await request(app).post('/api/v1/orders').set('Cookie', cookie).send({ ticketId: ticket.id }).expect(409);

    expect(publishEventMock).not.toHaveBeenCalled();
  });

  it('creates an order, returns 201, and publishes OrderCreatedEvent', async () => {
    const cookie = getAuthCookie({ userId: 'user-1', email: 'test@test.com' });
    const ticket = await buildTicket({ price: 99, title: 'VIP' });

    const before = Date.now();

    const res = await request(app)
      .post('/api/v1/orders')
      .set('Cookie', cookie)
      .send({ ticketId: ticket.id })
      .expect(201);

    const after = Date.now();

    // persisted
    const saved = await Order.findById(res.body.id);
    if (!saved) {
      throw new Error('Expected order to exist');
    }

    // API response
    expect(res.body).toMatchObject({
      id: expect.any(String),
      status: OrderStatuses.Created,
      expiresAt: expect.any(String),
      ticket: {
        id: ticket.id,
        title: 'VIP',
        price: 99,
      },
    });

    // expiresAt is around now + 15 min (tolerance)
    const expiresAtMs = Date.parse(res.body.expiresAt);
    // TODO change after test
    // const expectedMin = before + 15 * 60 * 1000;
    // const expectedMax = after + 15 * 60 * 1000;
    const expectedMin = before + 60 * 1000;
    const expectedMax = after + 60 * 1000;

    expect(expiresAtMs).toBeGreaterThanOrEqual(expectedMin);
    expect(expiresAtMs).toBeLessThanOrEqual(expectedMax);

    // publishEvent assertions
    expect(publishEventMock).toHaveBeenCalledTimes(1);

    const [def, data, opts] = publishEventMock.mock.calls[0];

    expect(def).toBe(OrderCreatedEvent);

    expect(data).toMatchObject({
      id: saved.id,
      userId: 'user-1',
      status: OrderStatuses.Created,
      ticket: { id: ticket.id, price: 99 },
      version: saved.version,
    });

    // event expiresAt sanity
    expect(typeof data.expiresAt).toBe('string');
    expect(Date.parse(data.expiresAt)).toBeGreaterThan(0);

    expect(opts).toEqual({ correlationId: undefined });
  });

  it('passes correlationId from x-request-id header when present', async () => {
    const cookie = getAuthCookie({ userId: 'user-1', email: 'test@test.com' });
    const ticket = await buildTicket({ price: 10, title: 'A' });

    await request(app)
      .post('/api/v1/orders')
      .set('Cookie', cookie)
      .set('x-request-id', 'req-123')
      .send({ ticketId: ticket.id })
      .expect(201);

    expect(publishEventMock).toHaveBeenCalledTimes(1);

    const [, , opts] = publishEventMock.mock.calls[0];
    expect(opts).toEqual({ correlationId: 'req-123' });
  });

  it('CONCURRENCY: two parallel creates reserve the ticket once (201 + 409) and publish once', async () => {
    // autoIndex=false in tests => ensure indexes exist
    await Order.syncIndexes();

    const cookie = getAuthCookie({ userId: 'user-1', email: 'test@test.com' });
    const ticket = await buildTicket();

    const [r1, r2] = await Promise.all([
      request(app).post('/api/v1/orders').set('Cookie', cookie).send({ ticketId: ticket.id }),
      request(app).post('/api/v1/orders').set('Cookie', cookie).send({ ticketId: ticket.id }),
    ]);

    const statuses = [r1.status, r2.status].sort();
    expect(statuses).toEqual([201, 409]);

    // Only one active order for that ticket
    const orders = await Order.find({
      ticket: ticket._id,
      status: { $in: [OrderStatuses.Created, OrderStatuses.AwaitingPayment] },
    });
    expect(orders).toHaveLength(1);

    // Only one event should be published (the winner request)
    expect(publishEventMock).toHaveBeenCalledTimes(1);

    // Optional: ensure the loser has your business error shape
    const loser = r1.status === 409 ? r1 : r2;
    expect(loser.body).toMatchObject({
      code: 'BUSINESS_RULE',
      reason: 'TICKET_RESERVED',
    });
  });
});
