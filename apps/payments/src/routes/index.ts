import express from 'express';

import { createPaymentRouter } from './create-payment';

const router = express.Router();

router.use(createPaymentRouter);

export { router as paymentsRouter };
