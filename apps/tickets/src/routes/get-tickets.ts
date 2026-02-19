import type { Request, Response } from 'express';
import express from 'express';

import { asyncHandler, validate, withPagination } from '@org/core';

import { Ticket } from '../models';
import { buildTicketsFilter, GetTicketsQuerySchema } from '../utils';

const router = express.Router();

/**
 * GET /api/v1/tickets
 *
 * Query:
 *  - limit (default 20, max 100)
 *  - cursor (optional) - ticket id for cursor pagination (newest first)
 *  - userId (optional) - filter by owner userId
 *  - q (optional) - search by title
 *  - reserved (optional boolean) - true => only reserved, false => only not reserved
 *
 * Response: CursorPage<Ticket>
 *  { items: Ticket[], pageInfo: { hasNextPage, nextCursor? } }
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const query = validate(GetTicketsQuerySchema, req.query, 'TICKETS_INVALID_QUERY');
    const filter = buildTicketsFilter(query);

    const items = await Ticket.find(filter)
      .sort({ _id: -1 })
      .limit(query.limit + 1);

    res.status(200).send(withPagination(items, query.limit));
  }),
);

export { router as listTicketsRouter };
