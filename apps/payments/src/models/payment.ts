import mongoose, { type Document, type Model, Schema } from 'mongoose';

import { type PaymentProvider, PaymentProviderValues } from '@org/contracts';

import { type PaymentStatus, PaymentStatuses } from '../types';

import type { OrderDoc } from './order';

interface PaymentAttrs {
  order: OrderDoc;
  userId: string;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  providerId: string; // stripe charge/paymentIntent id
  status: PaymentStatus;
}

export interface PaymentDoc extends Document {
  id: string;
  order: mongoose.Types.ObjectId | OrderDoc;
  userId: string;
  amount: number;
  currency: string;
  provider: string;
  providerId: string;
  status: PaymentStatus;

  createdAt: Date;
  updatedAt: Date;
  version: number;
}

interface PaymentModel extends Model<PaymentDoc> {
  build(attrs: PaymentAttrs): PaymentDoc;
}

const paymentSchema = new mongoose.Schema<PaymentDoc>(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true },
    provider: { type: String, required: true, enum: PaymentProviderValues },
    providerId: { type: String, required: true, unique: true },
    status: { type: String, required: true, enum: Object.values(PaymentStatuses) },
  },
  {
    versionKey: 'version',
    timestamps: true,
    optimisticConcurrency: true,
  },
);

paymentSchema.statics.build = (attrs: PaymentAttrs) => new Payment(attrs);

paymentSchema.set('toJSON', {
  transform(_doc, json) {
    const {
      _id,
      id: _i,
      createdAt: _c,
      updatedAt: _u,
      userId: _d,
      version: _v,
      providerId: _p,
      provider: _pr,
      ...rest
    } = json;
    return { id: _id.toString(), ...rest };
  },
});

export const Payment = mongoose.model<PaymentDoc, PaymentModel>('Payment', paymentSchema);
