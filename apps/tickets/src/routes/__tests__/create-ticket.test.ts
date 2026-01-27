import request from 'supertest';

import { getAuthCookie } from '@org/test-utils';

import { createApp } from '../../app';
import { Ticket } from '../../models';

const app = createApp();

describe('POST /api/v1/tickets', () => {
  it('rejects when not authenticated', async () => {
    const res = await request(app).post('/api/v1/tickets').send({ title: 'My Ticket', price: 25 }).expect(401);

    expect(res.body).toMatchObject({
      code: 'AUTHENTICATION',
      reason: 'NOT_AUTHENTICATED',
      message: expect.any(String),
    });
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
  });

  it('creates ticket and returns 201', async () => {
    const cookie = getAuthCookie({ userId: 'user-1', email: 'test@test.com' });

    const res = await request(app)
      .post('/api/v1/tickets')
      .set('Cookie', cookie)
      .send({ title: 'My Ticket', price: 25 })
      .expect(201);

    expect(res.body).toMatchObject({
      title: 'My Ticket',
      price: 25,
      userId: 'user-1',
      id: expect.any(String),
    });

    const saved = await Ticket.findById(res.body.id);
    if (!saved) {
      throw new Error('Expected ticket to be saved');
    }
    expect(saved.title).toBe('My Ticket');
    expect(saved.price).toBe(25);
    expect(saved.userId).toBe('user-1');
  });
});
