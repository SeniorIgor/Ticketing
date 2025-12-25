import mongoose from 'mongoose';

import { hashPassword } from '@org/core';

interface UserAttrs {
  email: string;
  password: string;
}

interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

const userSchema = new mongoose.Schema<UserDoc, UserModel>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

userSchema.set('toJSON', {
  transform(_doc, json) {
    const { password: _password, ...rest } = json;
    return rest;
  },
});

userSchema.pre('save', async function () {
  if (this.isModified('password')) {
    this.password = await hashPassword(this.password);
  }
});

export const User = mongoose.model<UserDoc, UserModel>('User', userSchema);
