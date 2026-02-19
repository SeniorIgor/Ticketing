import type { Request, Response } from 'express';
import express from 'express';

import { currentUser } from '@org/core';

const router = express.Router();

router.get('/current-user', currentUser, (req: Request, res: Response) => {
  res.send({ currentUser: req.currentUser ?? null });
});

export { router as currentUserRouter };
