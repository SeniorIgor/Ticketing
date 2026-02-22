import type { Request, Response } from 'express';
import express from 'express';

import { OrderStatuses, PaymentProviders } from '@org/contracts';
import { asyncHandler, AuthorizationError, BusinessRuleError, NotFoundError, requireAuth, validate } from '@org/core';

import { Order } from '../models/order';
import type { CreatePaymentIntentReqBody } from '../utils/create-payment-intent.schema';
import { CreatePaymentIntentBodySchema } from '../utils/create-payment-intent.schema';
import { createPaymentIntent } from '../vendor/stripe';

const router = express.Router();

/**
 * POST /api/v1/payments/intents
 * Returns Stripe clientSecret for the order.
 */
router.post(
  '/intents',
  requireAuth,
  asyncHandler(async (req: Request<unknown, unknown, CreatePaymentIntentReqBody>, res: Response) => {
    const body = validate(CreatePaymentIntentBodySchema, req.body, 'PAYMENT_INTENT_INVALID_INPUT');
    const { orderId } = body;

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

    const currency = 'usd';
    const amountCents = Math.round(order.price * 100);

    const intent = await createPaymentIntent({
      amount: amountCents,
      currency,
      idempotencyKey: orderId,
      description: `Order ${orderId}`,
      metadata: { orderId, userId },
    });

    if (!intent.client_secret) {
      throw new BusinessRuleError('PAYMENT_INTENT_NO_SECRET', 'Stripe did not return clientSecret');
    }

    res.status(201).send({
      provider: PaymentProviders.Stripe,
      providerId: intent.id,
      clientSecret: intent.client_secret,
      status: intent.status,
    });
  }),
);

export { router as createPaymentIntentRouter };
