import type { Document, Model } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

import { OrderStatuses } from '../types';

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
  applyUpdateFromEvent(data: TicketAttrs): Promise<TicketDoc | null>;
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

ticketSchema.statics.applyUpdateFromEvent = function ({ id, price, title, version }: TicketAttrs) {
  return this.findOneAndUpdate({ _id: id, version: version - 1 }, { $set: { price, title, version } }, { new: true });
};

ticketSchema.methods.isReserved = async function (this: TicketDoc) {
  const existing = await Order.exists({
    ticket: this._id,
    status: { $in: [OrderStatuses.Created, OrderStatuses.AwaitingPayment, OrderStatuses.Complete] },
  });

  return !!existing;
};

ticketSchema.set('toJSON', {
  transform(_doc, json) {
    const { _id, id: _, createdAt: _c, updatedAt: _u, version: _v, ...rest } = json;

    return { id: _id.toString(), ...rest };
  },
});

export const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);
