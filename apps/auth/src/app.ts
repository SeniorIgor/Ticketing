import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';

import { errorHandler, notFoundHandler, requestId } from '@org/core';

import { usersRouter } from './routes';

export function createApp() {
  const app = express();

  app.set('trust proxy', true);

  app.use(requestId);

  app.use(express.json());
  app.use(cors());
  app.use(cookieParser());

  app.use('/api/v1/users', usersRouter);

  app.use(notFoundHandler);

  app.use(errorHandler);

  return app;
}
