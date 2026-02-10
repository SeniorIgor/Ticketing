import mongoose from 'mongoose';
import request from 'supertest';

import { TicketUpdatedEvent } from '@org/contracts';
import { getAuthCookie } from '@org/test-utils';

import { createApp } from '../../app';
import { Ticket } from '../../models';
import { publishEventMock } from '../../test/mocks';

const app = createApp();

describe('PUT /api/v1/tickets/:id', () => {
  it('rejects when not authenticated', async () => {
    const ticket = await Ticket.build({ title: 'Old', price: 10, userId: 'user-1' }).save();

    await request(app).put(`/api/v1/tickets/${ticket.id}`).send({ title: 'New' }).expect(401);

    expect(publishEventMock).not.toHaveBeenCalled();
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

    expect(publishEventMock).not.toHaveBeenCalled();
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

    expect(publishEventMock).not.toHaveBeenCalled();
  });

  it('returns 404 when ticket does not exist', async () => {
    const cookie = getAuthCookie({ userId: 'user-1', email: 'test@test.com' });
    const nonExistingId = new mongoose.Types.ObjectId().toHexString();

    await request(app).put(`/api/v1/tickets/${nonExistingId}`).set('Cookie', cookie).send({ title: 'New' }).expect(404);

    expect(publishEventMock).not.toHaveBeenCalled();
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

    expect(publishEventMock).not.toHaveBeenCalled();
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

    expect(publishEventMock).not.toHaveBeenCalled();
  });

  it('allows partial update (price only) and publishes event', async () => {
    const ticket = await Ticket.build({ title: 'Old', price: 10, userId: 'user-1' }).save();
    const cookie = getAuthCookie({ userId: 'user-1', email: 'test@test.com' });

    await request(app)
      .put(`/api/v1/tickets/${ticket.id}`)
      .set('Cookie', cookie)
      .set('x-request-id', 'test-request-id')
      .send({ price: 20 })
      .expect(200);

    const updated = await Ticket.findById(ticket.id);
    if (!updated) {
      throw new Error('Expected ticket to exist');
    }

    expect(updated.title).toBe('Old');
    expect(updated.price).toBe(20);

    expect(publishEventMock).toHaveBeenCalledTimes(1);
    expect(publishEventMock).toHaveBeenCalledWith(
      TicketUpdatedEvent,
      expect.objectContaining({
        id: updated.id,
        title: 'Old',
        price: 20,
        userId: 'user-1',
        version: expect.any(Number),
      }),
      expect.objectContaining({
        correlationId: 'test-request-id',
      }),
    );
  });

  it('rejects update when ticket is reserved and does not publish event', async () => {
    const cookie = getAuthCookie({ userId: 'user-1', email: 'test@test.com' });

    // ticket owned by user, but reserved
    const ticket = await Ticket.build({ title: 'Old', price: 10, userId: 'user-1' }).save();
    ticket.orderId = new mongoose.Types.ObjectId().toHexString();
    await ticket.save();

    const res = await request(app)
      .put(`/api/v1/tickets/${ticket.id}`)
      .set('Cookie', cookie)
      .send({ title: 'New', price: 99 })
      .expect(409);

    expect(res.body).toMatchObject({
      code: 'BUSINESS_RULE',
      reason: 'TICKET_RESERVED',
      message: expect.any(String),
    });

    // ensure ticket didn't change
    const saved = await Ticket.findById(ticket.id);
    if (!saved) {
      throw new Error('Expected ticket to exist');
    }

    expect(saved.title).toBe('Old');
    expect(saved.price).toBe(10);
    expect(saved.orderId).toBeTruthy();

    expect(publishEventMock).not.toHaveBeenCalled();
  });

  it('updates ticket when owned by user and publishes event', async () => {
    const ticket = await Ticket.build({ title: 'Old', price: 10, userId: 'user-1' }).save();
    const cookie = getAuthCookie({ userId: 'user-1', email: 'test@test.com' });

    await request(app)
      .put(`/api/v1/tickets/${ticket.id}`)
      .set('Cookie', cookie)
      .set('x-request-id', 'test-request-id')
      .send({ title: 'New', price: 99 })
      .expect(200);

    const updated = await Ticket.findById(ticket.id);
    if (!updated) {
      throw new Error('Expected ticket to exist');
    }

    expect(updated.title).toBe('New');
    expect(updated.price).toBe(99);

    expect(publishEventMock).toHaveBeenCalledTimes(1);
    expect(publishEventMock).toHaveBeenCalledWith(
      TicketUpdatedEvent,
      expect.objectContaining({
        id: updated.id,
        title: 'New',
        price: 99,
        userId: 'user-1',
        version: expect.any(Number),
      }),
      expect.objectContaining({
        correlationId: 'test-request-id',
      }),
    );
  });
});
