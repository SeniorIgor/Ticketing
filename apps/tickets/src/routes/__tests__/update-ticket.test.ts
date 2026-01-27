import request from 'supertest';

import { getAuthCookie } from '@org/test-utils';

import { createApp } from '../../app';
import { Ticket } from '../../models';

const app = createApp();

describe('PUT /api/v1/tickets/:id', () => {
  it('rejects when not authenticated', async () => {
    const ticket = await Ticket.build({ title: 'Old', price: 10, userId: 'user-1' }).save();

    await request(app).put(`/api/v1/tickets/${ticket.id}`).send({ title: 'New' }).expect(401);
  });

  it('rejects when ticket not owned by user', async () => {
    const ticket = await Ticket.build({ title: 'Owned', price: 10, userId: 'user-1' }).save();
    const cookie = getAuthCookie({ userId: 'user-2', email: 'test@test.com' });

    const res = await request(app)
      .put(`/api/v1/tickets/${ticket.id}`)
      .set('Cookie', cookie)
      .send({ title: 'Hacked' })
      .expect(409); // or 403 depending on your core mapping

    expect(res.body).toMatchObject({
      code: expect.any(String),
      reason: 'TICKET_NOT_OWNER',
      message: expect.any(String),
    });
  });

  it('updates ticket when owned by user', async () => {
    const ticket = await Ticket.build({ title: 'Old', price: 10, userId: 'user-1' }).save();
    const cookie = getAuthCookie({ userId: 'user-1', email: 'test@test.com' });

    const res = await request(app)
      .put(`/api/v1/tickets/${ticket.id}`)
      .set('Cookie', cookie)
      .send({ title: 'New', price: 99 })
      .expect(200);

    expect(res.body).toMatchObject({
      id: ticket.id,
      title: 'New',
      price: 99,
      userId: 'user-1',
    });
  });
});
