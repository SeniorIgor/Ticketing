import request from 'supertest';

import { TicketCreatedEvent } from '@org/contracts';
import { getAuthCookie } from '@org/test-utils';

import { createApp } from '../../app';
import { Ticket } from '../../models';
import { publishEventMock } from '../../test/mocks';

const app = createApp();

describe('POST /api/v1/tickets', () => {
  beforeEach(() => {
    publishEventMock.mockClear();
  });

  it('rejects when not authenticated', async () => {
    const res = await request(app).post('/api/v1/tickets').send({ title: 'My Ticket', price: 25 }).expect(401);

    expect(res.body).toMatchObject({
      code: 'AUTHENTICATION',
      reason: 'NOT_AUTHENTICATED',
      message: expect.any(String),
    });

    expect(publishEventMock).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid input', async () => {
    const cookie = getAuthCookie({ userId: 'user-1', email: 'test@test.com' });

    const res = await request(app)
      .post('/api/v1/tickets')
      .set('Cookie', cookie)
      .send({ title: 'aa', price: -1 })
      .expect(400);

    expect(res.body).toMatchObject({
      code: 'VALIDATION',
      reason: 'TICKET_INVALID_INPUT',
      message: expect.any(String),
      details: expect.any(Array),
    });

    expect(publishEventMock).not.toHaveBeenCalled();
  });

  it('creates ticket and publishes event, returns 201', async () => {
    const cookie = getAuthCookie({ userId: 'user-1', email: 'test@test.com' });

    const res = await request(app)
      .post('/api/v1/tickets')
      .set('Cookie', cookie)
      // optional: if you want correlationId to be set in event headers
      .set('x-request-id', 'test-request-id')
      .send({ title: 'My Ticket', price: 25 })
      .expect(201);

    expect(res.body).toMatchObject({
      title: 'My Ticket',
      price: 25,
      id: expect.any(String),
    });

    const saved = await Ticket.findById(res.body.id);
    if (!saved) {
      throw new Error('Expected ticket to be saved');
    }

    expect(saved.title).toBe('My Ticket');
    expect(saved.price).toBe(25);
    expect(saved.userId).toBe('user-1');

    expect(publishEventMock).toHaveBeenCalledTimes(1);
    expect(publishEventMock).toHaveBeenCalledWith(
      TicketCreatedEvent,
      expect.objectContaining({
        id: saved.id,
        title: 'My Ticket',
        price: 25,
        userId: 'user-1',
        version: expect.any(Number),
      }),
      expect.objectContaining({
        correlationId: 'test-request-id',
      }),
    );
  });
});
