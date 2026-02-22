import mongoose from 'mongoose';

export async function connectMongo(): Promise<void> {
  const mongoUri = process.env.PAYMENTS_MONGO_URI;

  if (!mongoUri) {
    throw new Error('PAYMENTS_MONGO_URI is not defined');
  }

  await mongoose.connect(mongoUri, {
    autoIndex: false,
    serverSelectionTimeoutMS: 5000,
  });

  console.log('✅ MongoDB connected');
}
