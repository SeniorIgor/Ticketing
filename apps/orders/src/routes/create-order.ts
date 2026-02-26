import type { Request, Response } from 'express';
import express from 'express';
import mongoose from 'mongoose';

import { OrderCreatedEvent, OrderStatuses } from '@org/contracts';
import { asyncHandler, BusinessRuleError, NotFoundError, requireAuth, ValidationError } from '@org/core';
import { publishEvent } from '@org/nats';

import { Order, Ticket } from '../models';
import type { CreateOrderReqBody } from '../types';
import { validateCreateOrder } from '../utils';

const router = express.Router();

// 15 min order expiration
// const EXPIRATION_SECONDS = 15 * 60;
// TODO change after test
const EXPIRATION_SECONDS = 60;

router.post(
  '/',
  requireAuth,
  asyncHandler(async (req: Request<unknown, unknown, CreateOrderReqBody>, res: Response) => {
    const errors = validateCreateOrder(req.body);
    if (errors.length > 0) {
      throw new ValidationError('ORDER_INVALID_INPUT', errors);
    }

    const ticket = await Ticket.findById(req.body.ticketId);
    if (!ticket) {
      throw new NotFoundError();
    }

    // Fast pre-check (still useful for nice error message),
    // but NOT sufficient for concurrency. DB unique index is the real guard.
    if (await ticket.isReserved()) {
      throw new BusinessRuleError('TICKET_RESERVED', 'Ticket is already reserved');
    }

    const expiresAt = new Date(Date.now() + EXPIRATION_SECONDS * 1000);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const userId = req.currentUser!.userId;

    const order = Order.build({
      userId,
      status: OrderStatuses.Created,
      expiresAt,
      ticket,
    });

    try {
      await order.save();
    } catch (err: unknown) {
      if (err instanceof mongoose.mongo.MongoServerError && err.code === 11000) {
        throw new BusinessRuleError('TICKET_RESERVED', 'Ticket is already reserved');
      }

      throw err;
    }

    await publishEvent(
      OrderCreatedEvent,
      {
        id: order.id,
        userId: order.userId,
        status: order.status,
        expiresAt: order.expiresAt.toISOString(),
        ticket: { id: ticket.id, price: ticket.price },
        version: order.version,
      },
      { correlationId: req.get('x-request-id') ?? undefined },
    );

    res.status(201).send(order);
  }),
);

export { router as createOrderRouter };
