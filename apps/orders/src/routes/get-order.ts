import type { Request, Response } from 'express';
import express from 'express';
import mongoose from 'mongoose';

import { asyncHandler, AuthorizationError, NotFoundError, requireAuth, ValidationError } from '@org/core';

import { Order } from '../models';

const router = express.Router();

type GetOrderRequestParams = {
  id: string;
};

router.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req: Request<GetOrderRequestParams>, res: Response) => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      throw new ValidationError('ORDER_INVALID_ID', [{ fieldName: 'id', message: 'Invalid order id' }]);
    }

    const order = await Order.findById(id).populate('ticket');
    if (!order) {
      throw new NotFoundError();
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const userId = req.currentUser!.userId;
    if (order.userId !== userId) {
      throw new AuthorizationError('ORDER_NOT_OWNER', 'You do not have access to this order');
    }

    res.send(order);
  }),
);

export { router as showOrderRouter };
