import type { NextFunction, Request, Response } from 'express';

import { BaseError } from '../errors/base-error';

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  // Known application error
  if (err instanceof BaseError) {
    return res.status(err.statusCode).json(err.apiError);
  }

  // Unknown error (fail-safe)
  if (err instanceof Error) {
    console.error('[http:error]', {
      method: req.method,
      path: req.originalUrl || req.url,
      requestId: req.requestId,
      userId: req.currentUser?.userId,
      message: err.message,
      stack: err.stack,
    });
  } else {
    console.error('[http:error]', {
      method: req.method,
      path: req.originalUrl || req.url,
      requestId: req.requestId,
      userId: req.currentUser?.userId,
      thrown: err,
    });
  }

  return res.status(500).json({
    code: 'INTERNAL',
    reason: null,
    message: 'Something went wrong',
    details: [],
  });
}
