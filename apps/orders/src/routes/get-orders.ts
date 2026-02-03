import type { Request, Response } from 'express';
import express from 'express';

import { asyncHandler, requireAuth } from '@org/core';

import { Order } from '../models';

const router = express.Router();

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const userId = req.currentUser!.userId;

    const orders = await Order.find({ userId }).populate('ticket').sort({ createdAt: -1 });

    res.send(orders);
  }),
);

export { router as listOrdersRouter };
