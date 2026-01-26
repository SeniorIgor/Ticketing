import { Router } from 'express';

import { createTicketRouter } from './create-ticket';
import { showTicketRouter } from './get-ticket';
import { listTicketsRouter } from './get-tickets';
import { updateTicketRouter } from './update-ticket';

const router = Router();

router.use('/api/v1/tickets', listTicketsRouter);
router.use('/api/v1/tickets', createTicketRouter);
router.use('/api/v1/tickets', showTicketRouter);
router.use('/api/v1/tickets', updateTicketRouter);

export { router as ticketsRouter };
