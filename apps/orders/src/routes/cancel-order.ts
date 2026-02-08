import type { Request, Response } from 'express';
import express from 'express';
import mongoose from 'mongoose';

import { OrderCancelledEvent } from '@org/contracts';
import { asyncHandler, AuthorizationError, NotFoundError, requireAuth, ValidationError } from '@org/core';
import { publishEvent } from '@org/nats';

import { Order } from '../models';
import { OrderStatus } from '../types/order-status';

const router = express.Router();

type CancelOrderRequestParams = {
  id: string;
};

router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req: Request<CancelOrderRequestParams>, res: Response) => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      throw new ValidationError('ORDER_INVALID_ID', [{ fieldName: 'id', message: 'Invalid order id' }]);
    }

    const order = await Order.findById(id);

    if (!order) {
      throw new NotFoundError();
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const userId = req.currentUser!.userId;

    if (order.userId !== userId) {
      throw new AuthorizationError('ORDER_NOT_OWNER', 'You do not have access to this order');
    }

    order.status = OrderStatus.Cancelled;
    await order.save();

    await publishEvent(
      OrderCancelledEvent,
      {
        id: order.id,
        userId: order.userId,
        ticket: { id: order.ticket.toString() },
        version: order.version,
      },
      { correlationId: req.get('x-request-id') ?? undefined },
    );

    res.status(204).send();
  }),
);

export { router as cancelOrderRouter };
