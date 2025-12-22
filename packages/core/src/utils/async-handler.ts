import type { NextFunction } from 'express';

export type AsyncRouteHandler<Req = Request, Res = Response> = (
  req: Req,
  res: Res,
  next: NextFunction,
) => Promise<unknown>;

/**
 * Wraps an async Express route handler and forwards any rejected promise
 * or thrown error to Express error-handling middleware.
 *
 * This utility eliminates the need for repetitive try/catch blocks in
 * async route handlers while keeping error flow explicit and framework-safe.
 *
 * @typeParam Req - Express request type
 * @typeParam Res - Express response type
 *
 * @param fn - Async Express handler function
 *
 * @returns An Express-compatible request handler that automatically
 *          passes errors to `next()`.
 *
 * @example
 * ```ts
 * router.get(
 *   '/users/:id',
 *   asyncHandler(async (req, res) => {
 *     const user = await userService.getById(req.params.id);
 *     if (!user) {
 *       throw new NotFoundError('User not found');
 *     }
 *     res.json(user);
 *   })
 * );
 * ```
 */
export const asyncHandler =
  <Req = Request, Res = Response>(fn: AsyncRouteHandler<Req, Res>) =>
  (req: Req, res: Res, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
