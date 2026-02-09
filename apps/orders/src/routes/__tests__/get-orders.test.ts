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

    const ticket1 = await buildTicket({ title: 'A' });
    const ticket2 = await buildTicket({ title: 'B' });
    const ticket3 = await buildTicket({ title: 'C' });

    const order1 = await buildOrder({ userId: 'user-1', ticket: ticket1 });
    const order2 = await buildOrder({ userId: 'user-1', ticket: ticket2 });
    const order3 = await buildOrder({ userId: 'user-2', ticket: ticket3 });

    const res = await request(app).get('/api/v1/orders').set('Cookie', cookie).expect(200);

    expect(res.body).toHaveLength(2);

    const orderIds = (res.body as OrderResponse[]).map((order) => order.id);
    expect(orderIds).toEqual(expect.arrayContaining([order1.id, order2.id]));
    expect(orderIds).not.toEqual(expect.arrayContaining([order3.id]));

    const ticketIds = (res.body as OrderResponse[]).map((order) => order.ticket.id);
    expect(ticketIds).toEqual(expect.arrayContaining([ticket1.id, ticket2.id]));
    expect(ticketIds).not.toEqual(expect.arrayContaining([ticket3.id]));
  });
});
