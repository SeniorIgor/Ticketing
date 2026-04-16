import type { Request, Response } from 'express';
import express from 'express';

import {
  asyncHandler,
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_OPTIONS,
  AuthenticationError,
  REFRESH_COOKIE_NAME,
  verifyJwt,
} from '@org/core';

import { User } from '../models';
import { clearAuthCookies, revokeRefreshSession, serializeAuthenticatedUser } from '../utils';

const router = express.Router();

router.get(
  '/current-user',
  asyncHandler(async (req: Request, res: Response) => {
    const accessToken = req.cookies?.[AUTH_COOKIE_NAME];
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

    if (!accessToken) {
      if (refreshToken) {
        throw new AuthenticationError('ACCESS_TOKEN_MISSING');
      }

      return res.send({ currentUser: null });
    }

    let payload: ReturnType<typeof verifyJwt>;

    try {
      payload = verifyJwt(accessToken);
    } catch {
      res.clearCookie(AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS);
      throw new AuthenticationError('INVALID_TOKEN');
    }

    const user = await User.findById(payload.userId);

    if (!user) {
      await revokeRefreshSession(refreshToken);
      clearAuthCookies(res);
      throw new AuthenticationError('INVALID_TOKEN');
    }

    return res.send({
      currentUser: serializeAuthenticatedUser(user),
    });
  }),
);

export { router as currentUserRouter };
