import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';

import { errorHandler, notFoundHandler, requestId } from '@org/core';
import { isNatsConnected } from '@org/nats';

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
    const natsReady = isNatsConnected();

    const ready = natsReady;

    res.status(ready ? 200 : 503).json({
      status: ready ? 'ready' : 'not-ready',
      nats: natsReady ? 'up' : 'down',
    });
  });

  app.use(notFoundHandler);

  app.use(errorHandler);

  return app;
}
