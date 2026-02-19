import type { NextFunction, Request, Response } from 'express';

import { AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS, verifyJwt } from '../auth';
import { AuthenticationError } from '../errors';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.auth;

  if (!token) {
    throw new AuthenticationError('NOT_AUTHENTICATED', 'Authentication required');
  }

  try {
    const payload = verifyJwt(token);
    req.currentUser = payload;
    next();
  } catch {
    res.clearCookie(AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS);
    throw new AuthenticationError('INVALID_TOKEN', 'Authentication required');
  }
}
