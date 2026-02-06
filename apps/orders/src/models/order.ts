import type { Document, Model } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

import type { OrderStatus } from '../types/order-status';
import { OrderStatus as OrderStatusEnum } from '../types/order-status';

interface OrderAttrs {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticketId: string;
}

export interface OrderDoc extends Document {
  id: string;
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticketId: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
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
      enum: Object.values(OrderStatusEnum),
      default: OrderStatusEnum.Created,
    },
    expiresAt: { type: Schema.Types.Date, required: true },
    ticketId: { type: String, required: true, index: true },
  },
  {
    versionKey: 'version',
    timestamps: true,
    optimisticConcurrency: true,
  },
);

orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order(attrs);
};

orderSchema.set('toJSON', {
  transform(_doc, json) {
    const { _id, id: _i, createdAt: _c, updatedAt: _u, userId: _d, version: _v, ...rest } = json;
    return { id: _id.toString(), ...rest };
  },
});

export const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);
