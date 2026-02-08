import type { Document, Model } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

import { OrderStatus } from '../types';

import { Order } from './order';

interface TicketAttrs {
  id: string;
  title: string;
  price: number;
  version: number;
}

export interface TicketDoc extends Document {
  id: string;
  title: string;
  price: number;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  isReserved(): Promise<boolean>;
}

interface TicketModel extends Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
}

const ticketSchema = new Schema<TicketDoc, TicketModel>(
  {
    title: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    version: { type: Number, required: true, min: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket({
    _id: attrs.id,
    title: attrs.title,
    price: attrs.price,
    version: attrs.version,
  });
};

ticketSchema.methods.isReserved = async function (this: TicketDoc) {
  const existing = await Order.exists({
    ticket: this._id,
    status: { $in: [OrderStatus.Created, OrderStatus.AwaitingPayment, OrderStatus.Complete] },
  });

  return !!existing;
};

ticketSchema.set('toJSON', {
  transform(_doc, json) {
    const { _id, id: _, createdAt: _c, updatedAt: _u, version: _v, ...rest } = json;
    return { id: _id, ...rest };
  },
});

export const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);
