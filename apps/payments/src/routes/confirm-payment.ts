import type { Request, Response } from 'express';
import express from 'express';

import { OrderStatuses, PaymentCreatedEvent, PaymentProviders } from '@org/contracts';
import { asyncHandler, AuthorizationError, BusinessRuleError, NotFoundError, requireAuth, validate } from '@org/core';
import { publishEvent } from '@org/nats';

import { Order } from '../models/order';
import { Payment } from '../models/payment';
import { PaymentStatuses } from '../types';
import { ConfirmPaymentBodySchema, type ConfirmPaymentReqBody } from '../utils/confirm-payment';
import { getPaymentIntent } from '../vendor/stripe';

const router = express.Router();

function isMongoDuplicateKeyError(err: unknown): err is { code: number } {
  return typeof err === 'object' && err !== null && 'code' in err && (err as { code: number }).code === 11000;
}

/**
 * POST /api/v1/payments/confirm
 * Client calls this AFTER Stripe confirmCardPayment() succeeds.
 * Server verifies intent and then creates Payment + publishes event.
 *
 * Concurrency safety:
 * - Payment has a unique index on { order }.
 * - If two requests race, only one insert wins.
 * - Loser gets E11000 -> we fetch and return the already created payment (no double event).
 */
router.post(
  '/confirm',
  requireAuth,
  asyncHandler(async (req: Request<unknown, unknown, ConfirmPaymentReqBody>, res: Response) => {
    const body = validate(ConfirmPaymentBodySchema, req.body, 'PAYMENT_CONFIRM_INVALID_INPUT');
    const { orderId, paymentIntentId } = body;

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

    // Fast-path: if payment already exists, return it.
    // (Do not throw here: it makes retries non-idempotent and doesn't solve races.)
    const existing = await Payment.findOne({ order: order._id });
    if (existing) {
      return res.status(200).send(existing);
    }

    const intent = await getPaymentIntent(paymentIntentId);

    // Basic anti-tampering checks
    if (intent.metadata?.orderId !== orderId || intent.metadata?.userId !== userId) {
      throw new BusinessRuleError('PAYMENT_INTENT_MISMATCH', 'PaymentIntent metadata mismatch');
    }

    const amountCents = Math.round(order.price * 100);
    if (intent.amount !== amountCents || intent.currency !== 'usd') {
      throw new BusinessRuleError('PAYMENT_INTENT_AMOUNT_MISMATCH', 'PaymentIntent amount/currency mismatch');
    }

    if (intent.status !== 'succeeded') {
      throw new BusinessRuleError('PAYMENT_NOT_SUCCEEDED', `Payment not succeeded. Status=${intent.status}`);
    }

    try {
      const payment = Payment.build({
        order,
        userId,
        amount: amountCents,
        currency: 'usd',
        provider: PaymentProviders.Stripe,
        providerId: intent.id, // pi_...
        status: PaymentStatuses.Succeeded,
      });

      await payment.save();

      await publishEvent(
        PaymentCreatedEvent,
        {
          id: payment.id,
          orderId: order.id,
          provider: payment.provider,
          providerId: payment.providerId,
        },
        { correlationId: req.get('x-request-id') ?? undefined },
      );

      return res.status(201).send(payment);
    } catch (err) {
      if (isMongoDuplicateKeyError(err)) {
        const created = await Payment.findOne({ order: order._id });
        if (created) {
          return res.status(200).send(created);
        }
      }

      throw err;
    }
  }),
);

export { router as confirmPaymentRouter };
