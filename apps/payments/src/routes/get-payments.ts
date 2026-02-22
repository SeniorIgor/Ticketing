import type { Request, Response } from 'express';
import express from 'express';

import { asyncHandler, requireAuth, validate, withPagination } from '@org/core';

import { Payment } from '../models/payment';
import { buildPaymentsFilter, GetPaymentsQuerySchema } from '../utils';

const router = express.Router();

/**
 * GET /api/v1/payments
 * Payment history for current user
 *
 * Query:
 *  - limit (default 20, max 100)
 *  - cursor (optional) - payment id for cursor pagination
 *  - orderId (optional)
 *  - status (optional)
 */
router.get(
  '/',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const query = validate(GetPaymentsQuerySchema, req.query, 'PAYMENTS_INVALID_QUERY');
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const filter = buildPaymentsFilter(req.currentUser!.userId, query);

    const items = await Payment.find(filter)
      .sort({ _id: -1 })
      .limit(query.limit + 1);

    res.status(200).send(withPagination(items, query.limit));
  }),
);

export { router as getPaymentsRouter };
