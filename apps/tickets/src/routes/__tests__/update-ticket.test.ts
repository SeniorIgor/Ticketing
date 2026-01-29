import mongoose from 'mongoose';
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

  it('rejects when ticket not owned by user and does not modify ticket', async () => {
    const ticket = await Ticket.build({
      title: 'Owned',
      price: 10,
      userId: 'user-1',
    }).save();

    const cookie = getAuthCookie({ userId: 'user-2', email: 'test@test.com' });

    const res = await request(app)
      .put(`/api/v1/tickets/${ticket.id}`)
      .set('Cookie', cookie)
      .send({ title: 'Hacked', price: 999 })
      .expect(403);

    expect(res.body).toMatchObject({
      code: 'AUTHORIZATION',
      reason: 'TICKET_NOT_OWNER',
      message: expect.any(String),
    });

    const saved = await Ticket.findById(ticket.id);
    if (!saved) {
      throw new Error('Expected ticket to exist');
    }

    expect(saved.title).toBe('Owned');
    expect(saved.price).toBe(10);
  });

  it('rejects invalid id format', async () => {
    const cookie = getAuthCookie({ userId: 'user-1', email: 'test@test.com' });

    const res = await request(app)
      .put('/api/v1/tickets/not-an-id')
      .set('Cookie', cookie)
      .send({ title: 'New' })
      .expect(400);

    expect(res.body).toMatchObject({
      code: 'VALIDATION',
      reason: 'TICKET_INVALID_ID',
      details: expect.arrayContaining([expect.objectContaining({ fieldName: 'id' })]),
    });
  });

  it('returns 404 when ticket does not exist', async () => {
    const cookie = getAuthCookie({ userId: 'user-1', email: 'test@test.com' });
    const nonExistingId = new mongoose.Types.ObjectId().toHexString();

    await request(app).put(`/api/v1/tickets/${nonExistingId}`).set('Cookie', cookie).send({ title: 'New' }).expect(404);
  });

  it('rejects update with invalid title', async () => {
    const ticket = await Ticket.build({ title: 'Old', price: 10, userId: 'user-1' }).save();
    const cookie = getAuthCookie({ userId: 'user-1', email: 'test@test.com' });

    const res = await request(app)
      .put(`/api/v1/tickets/${ticket.id}`)
      .set('Cookie', cookie)
      .send({ title: 'aa' })
      .expect(400);

    expect(res.body).toMatchObject({
      code: 'VALIDATION',
      reason: 'TICKET_INVALID_INPUT',
      details: expect.arrayContaining([expect.objectContaining({ fieldName: 'title' })]),
    });
  });

  it('rejects update with invalid price', async () => {
    const ticket = await Ticket.build({ title: 'Old', price: 10, userId: 'user-1' }).save();
    const cookie = getAuthCookie({ userId: 'user-1', email: 'test@test.com' });

    const res = await request(app)
      .put(`/api/v1/tickets/${ticket.id}`)
      .set('Cookie', cookie)
      .send({ price: -5 })
      .expect(400);

    expect(res.body).toMatchObject({
      code: 'VALIDATION',
      reason: 'TICKET_INVALID_INPUT',
      details: expect.arrayContaining([expect.objectContaining({ fieldName: 'price' })]),
    });
  });

  it('allows partial update', async () => {
    const ticket = await Ticket.build({ title: 'Old', price: 10, userId: 'user-1' }).save();
    const cookie = getAuthCookie({ userId: 'user-1', email: 'test@test.com' });

    await request(app).put(`/api/v1/tickets/${ticket.id}`).set('Cookie', cookie).send({ price: 20 }).expect(200);

    const updated = await Ticket.findById(ticket.id);
    if (!updated) {
      throw new Error('Expected ticket to exist');
    }

    expect(updated.title).toBe('Old');
    expect(updated.price).toBe(20);
  });

  it('updates ticket when owned by user', async () => {
    const ticket = await Ticket.build({ title: 'Old', price: 10, userId: 'user-1' }).save();
    const cookie = getAuthCookie({ userId: 'user-1', email: 'test@test.com' });

    await request(app)
      .put(`/api/v1/tickets/${ticket.id}`)
      .set('Cookie', cookie)
      .send({ title: 'New', price: 99 })
      .expect(200);

    const updated = await Ticket.findById(ticket.id);

    if (!updated) {
      throw new Error('Expected ticket to exist');
    }

    expect(updated.title).toBe('New');
    expect(updated.price).toBe(99);
  });
});
