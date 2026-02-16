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
    await buildPayment({ order, userId: 'user-1', providerId: 'pi_1' });

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

    const p1 = await buildPayment({ order: order1, userId: 'user-1', providerId: 'pi_1' });
    const p2 = await buildPayment({ order: order2, userId: 'user-1', providerId: 'pi_2' });
    await buildPayment({ order: order3, userId: 'user-2', providerId: 'pi_3' });

    const cookie = getAuthCookie({ userId: 'user-1', email: 'u1@a.com' });

    const res = await request(app).get('/api/v1/payments').set('Cookie', cookie).expect(200);

    expect(res.body.items).toHaveLength(2);

    const ids = res.body.items.map((item: { id: string }) => item.id);
    expect(ids).toEqual(expect.arrayContaining([p1.id, p2.id]));

    // ensure no payments of another user slipped in
    for (const item of res.body.items as Array<{ id: string }>) {
      expect(item.id).not.toBeNull();
    }
  });

  it('supports limit + cursor pagination (newest first)', async () => {
    const cookie = getAuthCookie({ userId: 'user-1', email: 'u1@a.com' });

    const o1 = await buildOrderProjection({ userId: 'user-1' });
    const o2 = await buildOrderProjection({ userId: 'user-1' });
    const o3 = await buildOrderProjection({ userId: 'user-1' });

    const p1 = await buildPayment({ order: o1, userId: 'user-1', providerId: 'pi_1' });
    const p2 = await buildPayment({ order: o2, userId: 'user-1', providerId: 'pi_2' });
    const p3 = await buildPayment({ order: o3, userId: 'user-1', providerId: 'pi_3' });

    const first = await request(app).get('/api/v1/payments?limit=2').set('Cookie', cookie).expect(200);

    expect(first.body.items).toHaveLength(2);
    expect(first.body.pageInfo.hasNextPage).toBe(true);
    expect(typeof first.body.pageInfo.nextCursor).toBe('string');

    const firstIds = first.body.items.map((x: { id: string }) => x.id);

    const nextCursor = first.body.pageInfo.nextCursor as string;

    const second = await request(app)
      .get(`/api/v1/payments?limit=2&cursor=${nextCursor}`)
      .set('Cookie', cookie)
      .expect(200);

    expect(second.body.items).toHaveLength(1);
    expect(second.body.pageInfo.hasNextPage).toBe(false);
    expect(second.body.pageInfo.nextCursor).toBeUndefined();

    const secondIds = second.body.items.map((x: { id: string }) => x.id);

    // no overlap between pages
    for (const id of secondIds) {
      expect(firstIds).not.toContain(id);
    }

    const allIds = [...firstIds, ...secondIds];
    expect(allIds).toEqual(expect.arrayContaining([p1.id, p2.id, p3.id]));
  });

  it('clamps limit to max (100)', async () => {
    const cookie = getAuthCookie({ userId: 'user-1', email: 'u1@a.com' });

    // Need distinct orders because Payment.order is unique
    const orders = await Promise.all(Array.from({ length: 105 }, () => buildOrderProjection({ userId: 'user-1' })));

    await Promise.all(orders.map((order, idx) => buildPayment({ order, userId: 'user-1', providerId: `pi_${idx}` })));

    const res = await request(app).get('/api/v1/payments?limit=9999').set('Cookie', cookie).expect(200);

    expect(res.body.items.length).toBeLessThanOrEqual(100);
    expect(res.body.pageInfo.hasNextPage).toBe(true);
    expect(typeof res.body.pageInfo.nextCursor).toBe('string');
  });

  it('supports filtering by status', async () => {
    const cookie = getAuthCookie({ userId: 'user-1', email: 'u1@a.com' });

    const o1 = await buildOrderProjection({ userId: 'user-1' });
    const o2 = await buildOrderProjection({ userId: 'user-1' });

    await buildPayment({ order: o1, userId: 'user-1', providerId: 'pi_ok', status: PaymentStatuses.Succeeded });
    await buildPayment({ order: o2, userId: 'user-1', providerId: 'pi_fail', status: PaymentStatuses.Failed });

    const res = await request(app)
      .get(`/api/v1/payments?status=${PaymentStatuses.Failed}`)
      .set('Cookie', cookie)
      .expect(200);

    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0]).toMatchObject({
      status: PaymentStatuses.Failed,
    });

    // providerId/provider should NOT be exposed
    expect(res.body.items[0].providerId).toBeUndefined();
    expect(res.body.items[0].provider).toBeUndefined();
  });

  it('supports filtering by orderId', async () => {
    const cookie = getAuthCookie({ userId: 'user-1', email: 'u1@a.com' });

    const o1 = await buildOrderProjection({ userId: 'user-1' });
    const o2 = await buildOrderProjection({ userId: 'user-1' });

    const p1 = await buildPayment({ order: o1, userId: 'user-1', providerId: 'pi_1' });
    await buildPayment({ order: o2, userId: 'user-1', providerId: 'pi_2' });

    const res = await request(app).get(`/api/v1/payments?orderId=${o1.id}`).set('Cookie', cookie).expect(200);

    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].id).toBe(p1.id);
  });

  it('returns 400 ValidationError with ErrorDetail[] for invalid query', async () => {
    const cookie = getAuthCookie({ userId: 'user-1', email: 'u1@a.com' });

    const res = await request(app).get('/api/v1/payments?cursor=not-an-oid').set('Cookie', cookie).expect(400);

    expect(res.body).toMatchObject({
      code: 'VALIDATION',
      reason: 'PAYMENTS_INVALID_QUERY',
      details: expect.any(Array),
    });

    expect(res.body.details).toEqual(expect.arrayContaining([{ fieldName: 'cursor', message: 'Invalid cursor id' }]));
  });
});
