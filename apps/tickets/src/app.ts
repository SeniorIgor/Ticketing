import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';

import { errorHandler, NotFoundError, requestId } from '@org/core';

import { ticketsRouter } from './routes';

export function createApp() {
  const app = express();

  app.set('trust proxy', true);

  app.use(requestId);

  app.use(express.json());
  app.use(cors());
  app.use(cookieParser());

  app.use('/api/v1/tickets', ticketsRouter);

  app.use(() => {
    throw new NotFoundError();
  });

  app.use(errorHandler);

  return app;
}
