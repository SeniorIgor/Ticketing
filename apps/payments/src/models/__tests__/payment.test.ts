import mongoose from 'mongoose';

import { OrderStatuses, PaymentProviders } from '@org/contracts';

import { PaymentStatuses } from '../../types';
import { Order } from '../order';
import { Payment } from '../payment';

describe('payments: Payment model', () => {
  it('toJSON removes internal fields and exposes id', async () => {
    const order = Order.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      userId: 'user-1',
      status: OrderStatuses.AwaitingPayment,
      price: 10,
      version: 0,
    });
    await order.save();

    const payment = Payment.build({
      order,
      userId: 'user-1',
      amount: 1000,
      currency: 'usd',
      provider: PaymentProviders.Stripe,
      providerId: `pi_${new mongoose.Types.ObjectId().toHexString()}`,
      status: PaymentStatuses.Succeeded,
    });
    await payment.save();

    const json = payment.toJSON();

    expect(json).toHaveProperty('id');
    expect(json).not.toHaveProperty('_id');
    expect(json).not.toHaveProperty('userId');
    expect(json).not.toHaveProperty('version');
    expect(json).not.toHaveProperty('providerId');

    // With your current transform:
    expect(json).not.toHaveProperty('updatedAt');
    expect(json).toHaveProperty('createdAt');

    // You now expose provider:
    expect(json).toHaveProperty('provider', PaymentProviders.Stripe);
  });

  it('enforces unique payment per order (unique index on order)', async () => {
    // IMPORTANT: because autoIndex=false in tests, ensure indexes exist
    await Payment.syncIndexes();

    const order = await Order.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      userId: 'user-1',
      status: OrderStatuses.AwaitingPayment,
      price: 10,
      version: 0,
    }).save();

    await Payment.build({
      order,
      userId: 'user-1',
      amount: 1000,
      currency: 'usd',
      provider: PaymentProviders.Stripe,
      providerId: `pi_${new mongoose.Types.ObjectId().toHexString()}`,
      status: PaymentStatuses.Succeeded,
    }).save();

    const p2 = Payment.build({
      order,
      userId: 'user-1',
      amount: 1000,
      currency: 'usd',
      provider: PaymentProviders.Stripe,
      providerId: `pi_${new mongoose.Types.ObjectId().toHexString()}`,
      status: PaymentStatuses.Succeeded,
    });

    await expect(p2.save()).rejects.toMatchObject({ code: 11000 });
  });
});
