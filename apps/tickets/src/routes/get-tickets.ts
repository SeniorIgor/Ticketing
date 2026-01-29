import type { Request, Response } from 'express';
import express from 'express';

import { asyncHandler } from '@org/core';

import { Ticket } from '../models';

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (_req: Request, res: Response) => {
    const tickets = await Ticket.find().sort({ createdAt: -1 });

    res.send(tickets);
  }),
);

export { router as listTicketsRouter };
