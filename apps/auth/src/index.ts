import cors from 'cors';
import express from 'express';

import { asyncHandler, errorHandler, NotFoundError } from '@org/core';

import { usersRouter } from './routes';

const port = process.env.AUTH_PORT ? Number(process.env.AUTH_PORT) : 4001;

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/v1/users', usersRouter);

app.use(
  asyncHandler(async () => {
    throw new NotFoundError();
  }),
);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`[ ready ] Auth listening on ${port}`);
});
