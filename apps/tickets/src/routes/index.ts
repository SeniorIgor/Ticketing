import { Router } from 'express';

import { createTicketRouter } from './create-ticket';
import { showTicketRouter } from './get-ticket';
import { listTicketsRouter } from './get-tickets';
import { updateTicketRouter } from './update-ticket';

const router = Router();

router.use(listTicketsRouter);
router.use(createTicketRouter);
router.use(showTicketRouter);
router.use(updateTicketRouter);

export { router as ticketsRouter };
