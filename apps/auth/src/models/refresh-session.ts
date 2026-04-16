import mongoose from 'mongoose';

interface RefreshSessionAttrs {
  user: mongoose.Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
}

interface RefreshSessionDoc extends mongoose.Document {
  id: string;
  user: mongoose.Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  updatedAt: string;
  createdAt: string;
}

interface RefreshSessionModel extends mongoose.Model<RefreshSessionDoc> {
  build(attrs: RefreshSessionAttrs): RefreshSessionDoc;
}

const refreshSessionSchema = new mongoose.Schema<RefreshSessionDoc, RefreshSessionModel>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

refreshSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

refreshSessionSchema.statics.build = (attrs: RefreshSessionAttrs) => {
  return new RefreshSession(attrs);
};

refreshSessionSchema.set('toJSON', {
  transform(_doc, json) {
    const { _id, id: _i, updatedAt: _u, createdAt: _c, ...rest } = json;

    return {
      id: _id.toString(),
      ...rest,
    };
  },
});

export const RefreshSession = mongoose.model<RefreshSessionDoc, RefreshSessionModel>(
  'RefreshSession',
  refreshSessionSchema,
);
