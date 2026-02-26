import express from 'express';

import { confirmPaymentRouter } from './confirm-payment';
import { createPaymentIntentRouter } from './create-payment-intent';
import { getPaymentRouter } from './get-payment';
import { getPaymentsRouter } from './get-payments';

const router = express.Router();

router.use(createPaymentIntentRouter);
router.use(confirmPaymentRouter);
router.use(getPaymentRouter);
router.use(getPaymentsRouter);

export { router as paymentsRouter };
