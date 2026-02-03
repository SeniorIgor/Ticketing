import mongoose from 'mongoose';

interface TicketAttrs {
  id: string; // important: we want to set _id from event id
  title: string;
  price: number;
  version: number;
}

export interface TicketDoc extends mongoose.Document {
  id: string;
  title: string;
  price: number;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
}

const ticketSchema = new mongoose.Schema<TicketDoc, TicketModel>(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    version: { type: Number, required: true, min: 0 },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

// Make Mongo _id equal to incoming ticket id (string ObjectId from tickets service)
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
    const { _id, id: _i, createdAt: _c, updatedAt: _u, version: _v, ...rest } = json;
    return { id: _id.toString(), ...rest };
  },
});

export const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);
