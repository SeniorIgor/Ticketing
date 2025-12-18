import cors from 'cors';
import express from 'express';

import { variable } from '@org/core';

const port = process.env.AUTH_PORT ? Number(process.env.AUTH_PORT) : 4001;

const app = express();
app.use(express.json());
app.use(cors());

app.get('/api/v1/users/current-user', (req, res) => {
  res.send({ message: `Hello API ${variable}` });
});

app.listen(port, () => {
  console.log(`[ ready ] Auth listening on ${port}`);
});
