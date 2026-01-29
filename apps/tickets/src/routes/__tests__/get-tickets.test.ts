import request from 'supertest';

import { createApp } from '../../app';
import { Ticket } from '../../models';

const app = createApp();

describe('GET /api/v1/tickets', () => {
  it('returns empty array when no tickets', async () => {
    const res = await request(app).get('/api/v1/tickets').expect(200);
    expect(res.body).toEqual([]);
  });

  it('returns tickets sorted by createdAt desc', async () => {
    await Ticket.build({ title: 'Aaa', price: 10, userId: 'u1' }).save();
    await Ticket.build({ title: 'Bbb', price: 20, userId: 'u1' }).save();

    const res = await request(app).get('/api/v1/tickets').expect(200);

    expect(res.body).toHaveLength(2);
    expect(res.body[0].title).toBe('Bbb');
    expect(res.body[1].title).toBe('Aaa');
  });
});
