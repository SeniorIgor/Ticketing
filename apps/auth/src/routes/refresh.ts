import type { Request, Response } from 'express';
import express from 'express';

import { asyncHandler, AuthenticationError, REFRESH_COOKIE_NAME } from '@org/core';

import { clearAuthCookies, refreshSession, serializeAuthenticatedUser, setAuthCookies } from '../utils';

const router = express.Router();

router.post(
  '/refresh',
  asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

    if (!refreshToken) {
      clearAuthCookies(res);
      throw new AuthenticationError('INVALID_REFRESH_TOKEN');
    }

    const session = await refreshSession(refreshToken);

    if (!session) {
      clearAuthCookies(res);
      throw new AuthenticationError('INVALID_REFRESH_TOKEN');
    }

    setAuthCookies(res, session);

    return res.status(200).send({
      currentUser: serializeAuthenticatedUser(session.user),
    });
  }),
);

export { router as refreshRouter };
