import type { Request, Response } from 'express';
import express from 'express';
import mongoose from 'mongoose';

import { TicketUpdatedEvent } from '@org/contracts';
import { asyncHandler, AuthorizationError, NotFoundError, requireAuth, ValidationError } from '@org/core';
import { publishEvent } from '@org/nats';

import { Ticket } from '../models';
import type { UpdateTicketReqBody } from '../types';
import { validateUpdateTicket } from '../utils/validate-update-ticket';

const router = express.Router();

type UpdateTicketRequestParams = {
  id: string;
};

router.put(
  '/:id',
  requireAuth,
  asyncHandler(async (req: Request<UpdateTicketRequestParams, unknown, UpdateTicketReqBody>, res: Response) => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      throw new ValidationError('TICKET_INVALID_ID', [{ fieldName: 'id', message: 'Invalid ticket id' }]);
    }

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      throw new NotFoundError();
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const userId = req.currentUser!.userId;

    if (ticket.userId !== userId) {
      throw new AuthorizationError('TICKET_NOT_OWNER', 'You are not allowed to edit this ticket');
    }

    const errors = validateUpdateTicket(req.body);
    if (errors.length > 0) {
      throw new ValidationError('TICKET_INVALID_INPUT', errors);
    }

    const { title, price } = req.body;

    if (title !== undefined) {
      ticket.title = title.trim();
    }

    if (price !== undefined) {
      ticket.price = price;
    }

    await ticket.save();

    await publishEvent(
      TicketUpdatedEvent,
      {
        id: ticket.id,
        title: ticket.title,
        price: ticket.price,
        userId: ticket.userId,
        version: ticket.version,
      },
      {
        correlationId: req.get('x-request-id') ?? undefined,
      },
    );

    res.send(ticket);
  }),
);

export { router as updateTicketRouter };
