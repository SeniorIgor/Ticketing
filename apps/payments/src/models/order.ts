import mongoose, { type Document, type Model, Schema } from 'mongoose';

import { type OrderStatus, OrderStatuses } from '../types';

type ApplyUpdateFromEventData = Pick<OrderAttrs, 'id' | 'version'>;

interface OrderAttrs {
  id: string; // orderId (string)
  userId: string;
  status: OrderStatus;
  price: number;
  version: number;
}

export interface OrderDoc extends Document {
  id: string;
  userId: string;
  status: OrderStatus;
  price: number;
  version: number;
}

interface OrderModel extends Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
  applyCancelledFromEvent(data: ApplyUpdateFromEventData): Promise<OrderAttrs | null>;
}

const orderSchema = new Schema<OrderDoc, OrderModel>(
  {
    userId: { type: String, required: true },
    status: { type: String, required: true, enum: Object.values(OrderStatuses) },
    price: { type: Number, required: true, min: 0 },
    version: { type: Number, required: true, default: 0 },
  },
  { versionKey: 'version' },
);

orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order({
    _id: attrs.id,
    userId: attrs.userId,
    status: attrs.status,
    price: attrs.price,
    version: attrs.version,
  });
};

orderSchema.statics.applyCancelledFromEvent = function ({ id, version }: ApplyUpdateFromEventData) {
  return this.findOneAndUpdate(
    { _id: id, version: version - 1 },
    { $set: { status: OrderStatuses.Cancelled, version } },
    { new: true },
  );
};

orderSchema.set('toJSON', {
  transform(_doc, json) {
    const { _id, id: _i, userId: _d, version: _v, ...rest } = json;
    return { id: _id.toString(), ...rest };
  },
});

export const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);
