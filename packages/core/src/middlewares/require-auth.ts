import type { NextFunction, Request, Response } from 'express';

import { verifyJwt } from '../auth';
import { AuthenticationError } from '../errors';

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.auth;

  if (!token) {
    throw new AuthenticationError('NOT_AUTHENTICATED', 'Authentication required');
  }

  try {
    const payload = verifyJwt(token);
    req.currentUser = payload;
    next();
  } catch {
    throw new AuthenticationError('INVALID_TOKEN', 'Authentication required');
  }
}
