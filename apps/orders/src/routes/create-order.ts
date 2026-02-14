import type { Request, Response } from 'express';
import express from 'express';

import { OrderCreatedEvent, OrderStatuses } from '@org/contracts';
import { asyncHandler, BusinessRuleError, NotFoundError, requireAuth, ValidationError } from '@org/core';
import { publishEvent } from '@org/nats';

import { Order, Ticket } from '../models';
import type { CreateOrderReqBody } from '../types';
import { validateCreateOrder } from '../utils';

const router = express.Router();

// 15 min order expiration
const EXPIRATION_SECONDS = 15 * 60;
// TODO change after test
// const EXPIRATION_SECONDS = 30;

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

    // Reservation check: a ticket can only have ONE active order at a time
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

    await order.save();

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
