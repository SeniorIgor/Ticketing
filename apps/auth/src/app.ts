import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';

import { errorHandler, notFoundHandler, requestId } from '@org/core';

import { usersRouter } from './routes';

export function createApp() {
  const app = express();

  app.set('trust proxy', true);

  app.use(requestId);
  // app.use(requestLogger);

  app.use(express.json());
  app.use(cors());
  app.use(cookieParser());

  app.get('/healthz', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.get('/readyz', (_req, res) => {
    const mongoReady = mongoose.connection.readyState === 1;
    const ready = mongoReady;

    res.status(ready ? 200 : 503).json({
      status: ready ? 'ready' : 'not-ready',
      mongo: mongoReady ? 'up' : 'down',
    });
  });

  app.use('/api/v1/users', usersRouter);

  app.use(notFoundHandler);

  app.use(errorHandler);

  return app;
}
