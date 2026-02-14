import type { Document, Model } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

import type { OrderStatus } from '@org/contracts';
import { OrderStatuses, OrderStatusValues } from '@org/contracts';

import type { TicketDoc } from './ticket';

interface OrderAttrs {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: TicketDoc;
}

export interface OrderDoc extends Document {
  id: string;
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  ticket: TicketDoc;
}

interface OrderModel extends Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
}

const orderSchema = new Schema<OrderDoc, OrderModel>(
  {
    userId: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: OrderStatusValues,
      default: OrderStatuses.Created,
    },
    expiresAt: { type: Schema.Types.Date },
    ticket: { type: Schema.Types.ObjectId, ref: 'Ticket', required: true },
  },
  {
    versionKey: 'version',
    timestamps: true,
    optimisticConcurrency: true,
  },
);

orderSchema.statics.build = (attrs: OrderAttrs) => new Order(attrs);

orderSchema.set('toJSON', {
  transform(_doc, json) {
    const { _id, id: _i, createdAt: _c, updatedAt: _u, userId: _d, version: _v, ...rest } = json;
    return { id: _id.toString(), ...rest };
  },
});

export const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);
