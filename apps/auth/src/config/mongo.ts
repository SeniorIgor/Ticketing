import mongoose from 'mongoose';

export async function connectMongo(): Promise<void> {
  const mongoUri = process.env.AUTH_MONGO_URI;

  if (!mongoUri) {
    throw new Error('AUTH_MONGO_URI is not defined');
  }

  await mongoose.connect(mongoUri, {
    autoIndex: false,
    serverSelectionTimeoutMS: 5000,
  });

  console.log('✅ MongoDB connected');
}
