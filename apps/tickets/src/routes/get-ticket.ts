import type { Request, Response } from 'express';
import express from 'express';
import mongoose from 'mongoose';

import { asyncHandler, NotFoundError, ValidationError } from '@org/core';

import { Ticket } from '../models';

const router = express.Router();

type GetTicketRequestParams = {
  id: string;
};

router.get(
  '/:id',
  asyncHandler(async (req: Request<GetTicketRequestParams>, res: Response) => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      throw new ValidationError('TICKET_INVALID_ID', [{ fieldName: 'id', message: 'Invalid ticket id' }]);
    }

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      throw new NotFoundError();
    }

    res.send(ticket);
  }),
);

export { router as showTicketRouter };
