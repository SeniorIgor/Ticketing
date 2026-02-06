import request from 'supertest';

import { getAuthCookie } from '@org/test-utils';

import { createApp } from '../../app';
import { buildOrder, buildTicket } from '../../test/helpers';

const app = createApp();

type OrderResponse = {
  id: string;
  ticket: { id: string };
};

describe('GET /api/v1/orders', () => {
  it('rejects when not authenticated', async () => {
    await request(app).get('/api/v1/orders').expect(401);
  });

  it('returns only orders for current user', async () => {
    const cookie = getAuthCookie({ userId: 'user-1', email: 'u1@test.com' });

    const t1 = await buildTicket({ title: 'A' });
    const t2 = await buildTicket({ title: 'B' });
    const t3 = await buildTicket({ title: 'C' });

    await buildOrder({ userId: 'user-1', ticket: t1 });
    await buildOrder({ userId: 'user-1', ticket: t2 });
    await buildOrder({ userId: 'user-2', ticket: t3 });

    const res = await request(app).get('/api/v1/orders').set('Cookie', cookie).expect(200);

    expect(res.body).toHaveLength(2);

    const ids = (res.body as OrderResponse[]).map((o) => o.ticket.id);

    expect(ids).toEqual(expect.arrayContaining([t1._id, t2._id]));
    expect(ids).not.toEqual(expect.arrayContaining([t3._id]));
  });
});
