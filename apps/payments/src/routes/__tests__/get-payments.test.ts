import request from 'supertest';

import { getAuthCookie } from '@org/test-utils';

import { createApp } from '../../app';
import { buildOrderProjection, buildPayment } from '../../test/helpers';
import { PaymentStatuses } from '../../types';

const app = createApp();

describe('GET /api/v1/payments', () => {
  it('rejects when not authenticated', async () => {
    await request(app).get('/api/v1/payments').expect(401);
  });

  it('returns CursorPage shape (items + pageInfo)', async () => {
    const cookie = getAuthCookie({ userId: 'user-1', email: 'u1@a.com' });

    const order = await buildOrderProjection({ userId: 'user-1' });
    await buildPayment({ order, userId: 'user-1', providerId: 'ch_1' });

    const res = await request(app).get('/api/v1/payments').set('Cookie', cookie).expect(200);

    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.pageInfo).toMatchObject({
      hasNextPage: expect.any(Boolean),
    });
  });

  it('returns only payments for current user', async () => {
    const order1 = await buildOrderProjection({ userId: 'user-1', price: 10 });
    const order2 = await buildOrderProjection({ userId: 'user-1', price: 20 });
    const order3 = await buildOrderProjection({ userId: 'user-2', price: 30 });

    const p1 = await buildPayment({ order: order1, userId: 'user-1', providerId: 'ch_1' });
    const p2 = await buildPayment({ order: order2, userId: 'user-1', providerId: 'ch_2' });
    await buildPayment({ order: order3, userId: 'user-2', providerId: 'ch_3' });

    const cookie = getAuthCookie({ userId: 'user-1', email: 'u1@a.com' });

    const res = await request(app).get('/api/v1/payments').set('Cookie', cookie).expect(200);

    expect(res.body.items).toHaveLength(2);
    const ids = res.body.items.map((item: { id: string }) => item.id);

    expect(ids).toEqual(expect.arrayContaining([p1.id, p2.id]));
    expect(ids).not.toEqual(expect.arrayContaining(['ch_3'])); // sanity
  });

  it('supports limit + cursor pagination (newest first)', async () => {
    const cookie = getAuthCookie({ userId: 'user-1', email: 'u1@a.com' });

    const o1 = await buildOrderProjection({ userId: 'user-1' });
    const o2 = await buildOrderProjection({ userId: 'user-1' });
    const o3 = await buildOrderProjection({ userId: 'user-1' });

    const p1 = await buildPayment({ order: o1, userId: 'user-1', providerId: 'ch_1' });
    const p2 = await buildPayment({ order: o2, userId: 'user-1', providerId: 'ch_2' });
    const p3 = await buildPayment({ order: o3, userId: 'user-1', providerId: 'ch_3' });

    const first = await request(app).get('/api/v1/payments?limit=2').set('Cookie', cookie).expect(200);

    expect(first.body.items).toHaveLength(2);
    expect(first.body.pageInfo.hasNextPage).toBe(true);
    expect(typeof first.body.pageInfo.nextCursor).toBe('string');

    const nextCursor = first.body.pageInfo.nextCursor as string;

    const second = await request(app)
      .get(`/api/v1/payments?limit=2&cursor=${nextCursor}`)
      .set('Cookie', cookie)
      .expect(200);

    expect(second.body.items).toHaveLength(1);
    expect(second.body.pageInfo.hasNextPage).toBe(false);
    expect(second.body.pageInfo.nextCursor).toBeUndefined();

    const allIds = [...first.body.items, ...second.body.items].map((item: { id: string }) => item.id);

    expect(allIds).toEqual(expect.arrayContaining([p1.id, p2.id, p3.id]));
  });

  it('clamps limit to max (100)', async () => {
    const cookie = getAuthCookie({ userId: 'user-1', email: 'u1@a.com' });

    // create > 100 payments
    const order = await buildOrderProjection({ userId: 'user-1' });
    const creates = Array.from({ length: 105 }, (_, idx) =>
      buildPayment({ order, userId: 'user-1', providerId: `ch_${idx}` }),
    );
    await Promise.all(creates);

    const res = await request(app).get('/api/v1/payments?limit=9999').set('Cookie', cookie).expect(200);

    // should return at most 100 items in the first page
    expect(res.body.items.length).toBeLessThanOrEqual(100);
    expect(res.body.pageInfo.hasNextPage).toBe(true);
  });

  it('supports filtering by status', async () => {
    const cookie = getAuthCookie({ userId: 'user-1', email: 'u1@a.com' });

    const o1 = await buildOrderProjection({ userId: 'user-1' });
    const o2 = await buildOrderProjection({ userId: 'user-1' });

    await buildPayment({ order: o1, userId: 'user-1', providerId: 'ch_ok', status: PaymentStatuses.Succeeded });
    await buildPayment({ order: o2, userId: 'user-1', providerId: 'ch_fail', status: PaymentStatuses.Failed });

    const res = await request(app)
      .get(`/api/v1/payments?status=${PaymentStatuses.Failed}`)
      .set('Cookie', cookie)
      .expect(200);

    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].providerId).toBe('ch_fail');
  });

  it('supports filtering by orderId', async () => {
    const cookie = getAuthCookie({ userId: 'user-1', email: 'u1@a.com' });

    const o1 = await buildOrderProjection({ userId: 'user-1' });
    const o2 = await buildOrderProjection({ userId: 'user-1' });

    const p1 = await buildPayment({ order: o1, userId: 'user-1', providerId: 'ch_1' });
    await buildPayment({ order: o2, userId: 'user-1', providerId: 'ch_2' });

    const res = await request(app).get(`/api/v1/payments?orderId=${o1.id}`).set('Cookie', cookie).expect(200);

    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].id).toBe(p1.id);
  });

  it('returns 400 ValidationError with ErrorDetail[] for invalid query', async () => {
    const cookie = getAuthCookie({ userId: 'user-1', email: 'u1@a.com' });

    const res = await request(app).get('/api/v1/payments?cursor=not-an-oid').set('Cookie', cookie).expect(400);

    // adjust to your BaseError format:
    // { code, reason, message, details: [{ fieldName, message }] }
    expect(res.body).toMatchObject({
      code: 'VALIDATION',
      reason: 'PAYMENTS_INVALID_QUERY',
      details: expect.any(Array),
    });

    expect(res.body.details[0]).toMatchObject({
      fieldName: 'cursor',
      message: 'Invalid cursor id',
    });
  });
});
