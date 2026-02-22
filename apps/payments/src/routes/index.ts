import express from 'express';

import { createPaymentRouter } from './create-payment';
import { getPaymentRouter } from './get-payment';
import { getPaymentsRouter } from './get-payments';

const router = express.Router();

router.use(createPaymentRouter);
router.use(getPaymentRouter);
router.use(getPaymentsRouter);

export { router as paymentsRouter };
