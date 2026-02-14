import type { Request, Response } from 'express';
import express from 'express';
import mongoose from 'mongoose';

import { asyncHandler, AuthorizationError, NotFoundError, requireAuth, ValidationError } from '@org/core';

import { Payment } from '../models/payment';

const router = express.Router();

/**
 * GET /api/v1/payments/:id
 * Returns a single payment for the current user
 */
router.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      throw new ValidationError('PAYMENT_INVALID_ID', [{ fieldName: 'id', message: 'Invalid payment id' }]);
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const userId = req.currentUser!.userId;

    const payment = await Payment.findById(id).populate('order');
    if (!payment) {
      throw new NotFoundError();
    }

    if (payment.userId !== userId) {
      throw new AuthorizationError('PAYMENT_NOT_OWNER', 'You are not allowed to access this payment');
    }

    res.status(200).send(payment);
  }),
);

export { router as getPaymentRouter };
