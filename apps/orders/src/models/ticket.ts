import type { Document, Model } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

interface TicketAttrs {
  id: string;
  title: string;
  price: number;
  version: number;
}

export interface TicketDoc extends Document<string> {
  _id: string;
  title: string;
  price: number;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

interface TicketModel extends Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
}

const ticketSchema = new Schema<TicketDoc, TicketModel>(
  {
    _id: { type: String, required: true },
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

ticketSchema.set('toJSON', {
  transform(_doc, json) {
    const { _id, createdAt: _c, updatedAt: _u, version: _v, ...rest } = json;
    return { id: _id, ...rest };
  },
});

export const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);
