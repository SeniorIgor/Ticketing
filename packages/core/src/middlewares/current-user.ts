import type { NextFunction, Request, Response } from 'express';

import { AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS, verifyJwt } from '../auth';

export function currentUser(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[AUTH_COOKIE_NAME];

  if (!token) {
    req.currentUser = undefined;
    return next();
  }

  try {
    req.currentUser = verifyJwt(token);
  } catch {
    res.clearCookie(AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS);
    req.currentUser = undefined;
  }

  next();
}
