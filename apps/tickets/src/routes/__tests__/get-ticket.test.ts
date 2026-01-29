import mongoose from 'mongoose';
import request from 'supertest';

import { createApp } from '../../app';
import { Ticket } from '../../models';

const app = createApp();

describe('GET /api/v1/tickets/:id', () => {
  it('returns 400 for invalid id', async () => {
    const res = await request(app).get('/api/v1/tickets/not-an-id').expect(400);

    expect(res.body).toMatchObject({
      code: 'VALIDATION',
      reason: 'TICKET_INVALID_ID',
      message: expect.any(String),
      details: expect.any(Array),
    });
  });

  it('returns 404 for valid id that does not exist', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();

    await request(app).get(`/api/v1/tickets/${id}`).expect(404);
  });

  it('returns ticket for existing id', async () => {
    const ticket = Ticket.build({ title: 'Concert', price: 50, userId: 'u1' });
    await ticket.save();

    const res = await request(app).get(`/api/v1/tickets/${ticket.id}`).expect(200);

    expect(res.body).toMatchObject({
      id: ticket.id,
      title: 'Concert',
      price: 50,
    });
  });
});
