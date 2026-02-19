import request from 'supertest';

import type { CursorPage } from '@org/core';

import { createApp } from '../../app';
import { Ticket } from '../../models';
import type { TicketDoc } from '../../models/ticket';

const app = createApp();

type TicketListItem = Pick<TicketDoc, 'id' | 'title' | 'price'>;

describe('GET /api/v1/tickets', () => {
  it('returns CursorPage shape (items + pageInfo)', async () => {
    await Ticket.build({ title: 'A', price: 10, userId: 'u1' }).save();

    const response = await request(app).get('/api/v1/tickets').expect(200);

    const body = response.body as CursorPage<TicketListItem>;

    expect(Array.isArray(body.items)).toBe(true);
    expect(body.pageInfo).toMatchObject({ hasNextPage: expect.any(Boolean) });
  });

  it('returns newest first', async () => {
    const olderTicket = await Ticket.build({ title: 'Old', price: 10, userId: 'u1' }).save();
    const newerTicket = await Ticket.build({ title: 'New', price: 20, userId: 'u1' }).save();

    const response = await request(app).get('/api/v1/tickets').expect(200);
    const body = response.body as CursorPage<TicketListItem>;

    expect(body.items).toHaveLength(2);
    expect(body.items[0].id).toBe(newerTicket.id);
    expect(body.items[1].id).toBe(olderTicket.id);
  });

  it('supports limit (top latest tickets)', async () => {
    await Ticket.build({ title: '1', price: 10, userId: 'u1' }).save();
    await Ticket.build({ title: '2', price: 10, userId: 'u1' }).save();
    await Ticket.build({ title: '3', price: 10, userId: 'u1' }).save();
    await Ticket.build({ title: '4', price: 10, userId: 'u1' }).save();

    const response = await request(app).get('/api/v1/tickets?limit=3').expect(200);
    const body = response.body as CursorPage<TicketListItem>;

    expect(body.items).toHaveLength(3);
  });

  it('supports cursor pagination', async () => {
    const ticketOne = await Ticket.build({ title: '1', price: 10, userId: 'u1' }).save();
    const ticketTwo = await Ticket.build({ title: '2', price: 10, userId: 'u1' }).save();
    const ticketThree = await Ticket.build({ title: '3', price: 10, userId: 'u1' }).save();

    const firstResponse = await request(app).get('/api/v1/tickets?limit=2').expect(200);
    const firstPage = firstResponse.body as CursorPage<TicketListItem>;

    expect(firstPage.items).toHaveLength(2);
    expect(firstPage.pageInfo.hasNextPage).toBe(true);
    expect(typeof firstPage.pageInfo.nextCursor).toBe('string');

    const nextCursor = firstPage.pageInfo.nextCursor as string;

    const secondResponse = await request(app).get(`/api/v1/tickets?limit=2&cursor=${nextCursor}`).expect(200);

    const secondPage = secondResponse.body as CursorPage<TicketListItem>;

    expect(secondPage.items).toHaveLength(1);
    expect(secondPage.pageInfo.hasNextPage).toBe(false);

    const allTicketIds = [...firstPage.items, ...secondPage.items].map((item) => item.id);

    expect(allTicketIds).toEqual(expect.arrayContaining([ticketOne.id, ticketTwo.id, ticketThree.id]));
  });

  it('filters by userId', async () => {
    await Ticket.build({ title: 'A', price: 10, userId: 'u1' }).save();
    await Ticket.build({ title: 'B', price: 10, userId: 'u2' }).save();

    const response = await request(app).get('/api/v1/tickets?userId=u1').expect(200);
    const body = response.body as CursorPage<TicketListItem>;

    expect(body.items).toHaveLength(1);
    expect(body.items[0]).toMatchObject({ title: 'A' });
  });

  it('filters by search (q)', async () => {
    await Ticket.build({ title: 'Rock Concert', price: 10, userId: 'u1' }).save();
    await Ticket.build({ title: 'Jazz Night', price: 10, userId: 'u1' }).save();

    const response = await request(app).get('/api/v1/tickets?q=concert').expect(200);
    const body = response.body as CursorPage<TicketListItem>;

    expect(body.items).toHaveLength(1);
    expect(body.items[0].title).toBe('Rock Concert');
  });

  it('filters reserved=true', async () => {
    const freeTicket = await Ticket.build({ title: 'Free', price: 10, userId: 'u1' }).save();

    const reservedTicket = await Ticket.build({ title: 'Reserved', price: 10, userId: 'u1' }).save();
    reservedTicket.orderId = 'o1';
    await reservedTicket.save();

    const response = await request(app).get('/api/v1/tickets?reserved=true').expect(200);
    const body = response.body as CursorPage<TicketListItem>;

    const returnedIds = body.items.map((item) => item.id);

    expect(returnedIds).toEqual([reservedTicket.id]);
    expect(returnedIds).not.toEqual(expect.arrayContaining([freeTicket.id]));
  });

  it('returns 400 for invalid cursor', async () => {
    const response = await request(app).get('/api/v1/tickets?cursor=not-an-oid').expect(400);

    expect(response.body).toMatchObject({
      code: 'VALIDATION',
      reason: 'TICKETS_INVALID_QUERY',
      details: expect.any(Array),
    });

    expect(response.body.details[0]).toMatchObject({
      fieldName: 'cursor',
      message: 'Invalid cursor id',
    });
  });

  it('clamps limit to max (100)', async () => {
    await Promise.all(
      Array.from({ length: 105 }).map((_, index) =>
        Ticket.build({ title: `T${index}`, price: 10, userId: 'u1' }).save(),
      ),
    );

    const response = await request(app).get('/api/v1/tickets?limit=9999').expect(200);
    const body = response.body as CursorPage<TicketListItem>;

    expect(body.items.length).toBeLessThanOrEqual(100);
    expect(body.pageInfo.hasNextPage).toBe(true);
  });
});
