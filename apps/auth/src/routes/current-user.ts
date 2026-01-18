import type { Request, Response } from 'express';
import express from 'express';

import { requireAuth } from '@org/core';

const router = express.Router();

router.get('/current-user', requireAuth, (req: Request, res: Response) => {
  res.send({ currentUser: req.currentUser });
});

export { router as currentUserRouter };
