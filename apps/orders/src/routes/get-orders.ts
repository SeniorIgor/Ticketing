import type { Request, Response } from 'express';
import express from 'express';

import { asyncHandler, requireAuth } from '@org/core';

import { Order } from '../models';
import { hydrateOrders } from '../utils';

const router = express.Router();

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const userId = req.currentUser!.userId;

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    const response = await hydrateOrders(orders);
    res.send(response);
  }),
);

export { router as listOrdersRouter };
