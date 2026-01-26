import crypto from 'crypto';
import type { NextFunction, Request, Response } from 'express';

export function requestId(req: Request, _res: Response, next: NextFunction) {
  req.requestId = req.header('x-request-id') ?? crypto.randomUUID();
  next();
}
