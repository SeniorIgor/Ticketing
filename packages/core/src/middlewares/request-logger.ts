import type { NextFunction, Request, Response } from 'express';

function shouldSkipRequest(path: string) {
  return path === '/healthz' || path === '/readyz';
}

function getLogMethod(statusCode: number) {
  if (statusCode >= 500) {
    return console.error;
  }

  if (statusCode >= 400) {
    return console.warn;
  }

  return console.info;
}

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const startedAt = process.hrtime.bigint();

  res.on('finish', () => {
    if (shouldSkipRequest(req.path)) {
      return;
    }

    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    const log = getLogMethod(res.statusCode);

    log('[http]', {
      method: req.method,
      path: req.originalUrl || req.url,
      status: res.statusCode,
      durationMs: Math.round(durationMs),
      requestId: req.requestId,
      userId: req.currentUser?.userId,
    });
  });

  next();
}
