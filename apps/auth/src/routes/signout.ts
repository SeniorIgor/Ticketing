import type { Request, Response } from 'express';
import express from 'express';

import { asyncHandler, REFRESH_COOKIE_NAME } from '@org/core';

import { clearAuthCookies, revokeRefreshSession } from '../utils';

const router = express.Router();

router.post(
  '/signout',
  asyncHandler(async (req: Request, res: Response) => {
    await revokeRefreshSession(req.cookies?.[REFRESH_COOKIE_NAME]);
    clearAuthCookies(res);

    res.status(204).send();
  }),
);

export { router as signoutRouter };
