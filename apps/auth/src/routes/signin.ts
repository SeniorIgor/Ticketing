import type { Request, Response } from 'express';
import express from 'express';

const router = express.Router();

router.post('/signin', (_req: Request, res: Response) => {
  res.send('Hi there!');
});

export { router as signinRouter };
