import type { Request, Response } from 'express';
import express from 'express';

import { OrderStatuses, PaymentCreatedEvent } from '@org/contracts';
import {
  asyncHandler,
  AuthorizationError,
  BusinessRuleError,
  NotFoundError,
  requireAuth,
  ValidationError,
} from '@org/core';
import { publishEvent } from '@org/nats';

import { Payment } from '../models';
import { Order } from '../models/order';
import { PaymentStatuses } from '../types';
import type { CreatePaymentReqBody } from '../types/requests';
import { validateCreatePayment } from '../utils/validate-create-payment';
import { stripe } from '../vendor'; // wrapper

const router = express.Router();

router.post(
  '/',
  requireAuth,
  asyncHandler(async (req: Request<unknown, unknown, CreatePaymentReqBody>, res: Response) => {
    const errors = validateCreatePayment(req.body);
    if (errors.length > 0) {
      throw new ValidationError('PAYMENT_INVALID_INPUT', errors);
    }

    const { orderId, token } = req.body;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const userId = req.currentUser!.userId;

    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== userId) {
      throw new AuthorizationError('PAYMENT_NOT_OWNER', 'You are not allowed to pay for this order');
    }

    if (order.status === OrderStatuses.Cancelled) {
      throw new BusinessRuleError('ORDER_CANCELLED', 'Cannot pay for a cancelled order');
    }

    if (order.status === OrderStatuses.Complete) {
      throw new BusinessRuleError('ORDER_ALREADY_COMPLETE', 'Order is already paid');
    }

    // (Optional) prevent double-pay quickly
    const existing = await Payment.findOne({ order: order._id });
    if (existing) {
      throw new BusinessRuleError('PAYMENT_ALREADY_EXISTS', 'Payment already exists for this order');
    }

    // provider call (mockable)
    const charge = await stripe.charge({
      token,
      amount: Math.round(order.price),
      currency: 'usd',
      idempotencyKey: orderId,
    });

    const payment = Payment.build({
      order,
      userId,
      amount: Math.round(order.price),
      currency: 'usd',
      provider: 'stripe',
      providerId: charge.id,
      status: PaymentStatuses.Succeeded,
    });

    await payment.save();

    await publishEvent(
      PaymentCreatedEvent,
      { id: payment.id, orderId: order.id, stripeId: payment.providerId },
      { correlationId: req.get('x-request-id') ?? undefined },
    );

    res.status(201).send(payment);
  }),
);

export { router as createPaymentRouter };
