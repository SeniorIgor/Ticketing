import express from 'express';

import { TicketCreatedEvent } from '@org/contracts';
import { asyncHandler, requireAuth, ValidationError } from '@org/core';
import { publishEvent } from '@org/nats';

import { Ticket } from '../models';
import type { CreateTicketReqBody } from '../types';
import { validateCreateTicket } from '../utils/validate-create-ticket';

const router = express.Router();

router.post(
  '/',
  requireAuth,
  asyncHandler(async (req: express.Request<unknown, unknown, CreateTicketReqBody>, res) => {
    const errors = validateCreateTicket(req.body);

    if (errors.length > 0) {
      throw new ValidationError('TICKET_INVALID_INPUT', errors);
    }

    const ticket = Ticket.build({
      title: req.body.title.trim(),
      price: req.body.price,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      userId: req.currentUser!.userId,
    });

    await ticket.save();

    await publishEvent(
      TicketCreatedEvent,
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

    res.status(201).send(ticket);
  }),
);

export { router as createTicketRouter };
