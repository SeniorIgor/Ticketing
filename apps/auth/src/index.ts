import express from 'express';

const host = process.env.HOST ?? 'localhost';
const port = process.env.AUTH_PORT ? Number(process.env.AUTH_PORT) : 4001;

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send({ message: 'Hello API' });
});

app.get('/some', (req, res) => {
  res.send({ message: 'Hello API' });
});

app.listen(port, host, () => {
  console.log(`[ ready ] Auth Service: http://${host}:${port}`);
});
