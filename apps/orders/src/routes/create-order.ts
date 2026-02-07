import type { Request, Response } from 'express';
import express from 'express';

import { asyncHandler, BusinessRuleError, NotFoundError, requireAuth, ValidationError } from '@org/core';

import { Order, Ticket } from '../models';
import { OrderStatus } from '../types/order-status';
import type { CreateOrderReqBody } from '../types/requests';
import { validateCreateOrder } from '../utils';

const router = express.Router();

// 15 min order expiration (example)
const EXPIRATION_SECONDS = 15 * 60;

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
    const existingOrder = await Order.findOne({
      ticketId: ticket._id,
      status: { $in: [OrderStatus.Created, OrderStatus.AwaitingPayment, OrderStatus.Complete] },
    });

    if (existingOrder) {
      throw new BusinessRuleError('TICKET_RESERVED', 'Ticket is already reserved');
    }

    const expiresAt = new Date(Date.now() + EXPIRATION_SECONDS * 1000);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const userId = req.currentUser!.userId;

    const order = Order.build({
      userId,
      status: OrderStatus.Created,
      expiresAt,
      ticketId: ticket._id,
    });

    await order.save();

    res.status(201).send({
      id: order.id,
      status: order.status,
      expiresAt: order.expiresAt,
      ticket: {
        id: ticket._id,
        title: ticket.title,
        price: ticket.price,
      },
    });
  }),
);

export { router as createOrderRouter };
