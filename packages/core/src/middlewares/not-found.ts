import type { NextFunction, Request, Response } from 'express';

import { NotFoundError } from '../errors';

export function notFoundHandler(_req: Request, _res: Response, _next: NextFunction) {
  throw new NotFoundError();
}
