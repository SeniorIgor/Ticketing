import type { Request, Response } from 'express';
import express from 'express';

import { AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS } from '@org/core';

const router = express.Router();

router.post('/signout', (_req: Request, res: Response) => {
  res.clearCookie(AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS);

  res.status(204).send();
});

export { router as signoutRouter };
