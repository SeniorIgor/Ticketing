import mongoose from 'mongoose';

interface TicketAttrs {
  title: string;
  price: number;
  userId: string; // owner
}

interface TicketDoc extends mongoose.Document {
  id: string;
  title: string;
  price: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
}

const ticketSchema = new mongoose.Schema<TicketDoc, TicketModel>(
  {
    title: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    userId: { type: String, required: true },
  },
  {
    timestamps: true,
    versionKey: 'version',
  },
);

ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket(attrs);
};

ticketSchema.set('toJSON', {
  transform(_doc, json) {
    const { _id, id: _i, createdAt: _c, updatedAt: _u, userId: _d, version: _v, ...rest } = json;
    return { id: _id.toString(), ...rest };
  },
});

export const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);
