import type { NextFunction, Request, Response } from 'express';

import { BaseError } from '../errors/base-error';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  // Known application error
  if (err instanceof BaseError) {
    return res.status(err.statusCode).json(err.apiError);
  }

  // Unknown error (fail-safe)
  if (err instanceof Error) {
    console.error(err.stack ?? err.message);
  } else {
    console.error('Non-error thrown:', err);
  }

  return res.status(500).json({
    code: 'INTERNAL',
    reason: null,
    message: 'Something went wrong',
    details: [],
  });
}
