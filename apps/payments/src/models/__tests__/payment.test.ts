import { buildOrderProjection, buildPayment } from '../../test/helpers';
import { PaymentStatuses } from '../../types';
import { Payment } from '../payment';

describe('payments: Payment model', () => {
  beforeAll(async () => {
    await Payment.syncIndexes();
  });

  it('toJSON removes internal fields and exposes id', async () => {
    const order = await buildOrderProjection();
    const payment = await buildPayment({ order, providerId: 'ch_1' });

    const json = payment.toJSON();
    expect(json).toHaveProperty('id');
    expect(json).not.toHaveProperty('_id');
    expect(json).not.toHaveProperty('userId');
    expect(json).not.toHaveProperty('version');
    expect(json).not.toHaveProperty('createdAt');
    expect(json).not.toHaveProperty('updatedAt');
  });

  it('enforces unique order (one payment per order)', async () => {
    const order = await buildOrderProjection();

    await buildPayment({ order, providerId: 'ch_1', status: PaymentStatuses.Succeeded });

    await expect(buildPayment({ order, providerId: 'ch_2', status: PaymentStatuses.Succeeded })).rejects.toThrow();
  });

  it('enforces unique providerId', async () => {
    const order1 = await buildOrderProjection();
    const order2 = await buildOrderProjection();

    await buildPayment({ order: order1, providerId: 'ch_same' });

    await expect(buildPayment({ order: order2, providerId: 'ch_same' })).rejects.toThrow();
  });
});
