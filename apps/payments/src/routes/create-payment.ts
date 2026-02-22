import type { Request, Response } from 'express';
import express from 'express';

import { OrderStatuses, PaymentCreatedEvent, PaymentProviders } from '@org/contracts';
import { asyncHandler, AuthorizationError, BusinessRuleError, NotFoundError, requireAuth, validate } from '@org/core';
import { publishEvent } from '@org/nats';

import { Payment } from '../models';
import { Order } from '../models/order';
import { PaymentStatuses } from '../types';
import { CreatePaymentBodySchema, type CreatePaymentReqBody } from '../utils';
import { createCharge } from '../vendor/stripe';

const router = express.Router();

router.post(
  '/',
  requireAuth,
  asyncHandler(async (req: Request<unknown, unknown, CreatePaymentReqBody>, res: Response) => {
    const body = validate(CreatePaymentBodySchema, req.body, 'PAYMENT_INVALID_INPUT');

    const { orderId, token } = body;
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

    const existing = await Payment.findOne({ order: order._id });
    if (existing) {
      throw new BusinessRuleError('PAYMENT_ALREADY_EXISTS', 'Payment already exists for this order');
    }

    const currency = 'usd';
    const amountCents = Math.round(order.price * 100);

    const charge = await createCharge({
      paymentMethodId: token, // token == pm_... (or "pm_card_visa" in test)
      amount: amountCents,
      currency,
      idempotencyKey: orderId,
      description: `Order ${orderId}`,
      metadata: { orderId, userId },
    });

    if (charge.status !== 'succeeded') {
      // For now: simplified flow => fail fast.
      // Later: return 202 + clientSecret for SCA flows (`requires_action`).
      throw new BusinessRuleError('PAYMENT_NOT_SUCCEEDED', `Payment did not succeed. Status=${charge.status}`);
    }

    const payment = Payment.build({
      order,
      userId,
      amount: amountCents,
      currency,
      provider: PaymentProviders.Stripe,
      providerId: charge.id, // PaymentIntent id (pi_...)
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

    res.status(201).send(payment);
  }),
);

export { router as createPaymentRouter };
