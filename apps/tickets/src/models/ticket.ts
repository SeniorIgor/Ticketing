import mongoose from 'mongoose';

import { type TicketStatus, TicketStatuses, TicketStatusValues } from '@org/contracts';

interface TicketAttrs {
  title: string;
  price: number;
  userId: string; // owner
}

export interface TicketDoc extends mongoose.Document {
  id: string;
  title: string;
  price: number;
  userId: string;

  status: TicketStatus;
  orderId?: string;

  createdAt: Date;
  updatedAt: Date;
  version: number;

  isReserved(): boolean;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
}

const ticketSchema = new mongoose.Schema<TicketDoc, TicketModel>(
  {
    title: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    userId: { type: String, required: true },

    status: {
      type: String,
      required: true,
      enum: TicketStatusValues,
      default: TicketStatuses.Available,
      index: true,
    },

    // Optional: used when status=reserved (and may remain for audit when sold).
    orderId: { type: String, required: false, index: true },
  },
  {
    timestamps: true,
    versionKey: 'version',
    optimisticConcurrency: true,
  },
);

ticketSchema.methods.isReserved = function isReserved(): boolean {
  return this.status !== TicketStatuses.Available;
};

ticketSchema.statics.build = (attrs: TicketAttrs) => new Ticket(attrs);

ticketSchema.set('toJSON', {
  transform(_doc, json) {
    const { _id, id: _i, createdAt: _c, updatedAt: _u, userId: _d, version: _v, ...rest } = json;
    return { id: _id.toString(), ...rest };
  },
});

export const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);
