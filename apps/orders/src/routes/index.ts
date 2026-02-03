import express from 'express';

import { cancelOrderRouter } from './cancel-order';
import { createOrderRouter } from './create-order';
import { showOrderRouter } from './get-order';
import { listOrdersRouter } from './get-orders';

const router = express.Router();

router.use(listOrdersRouter);
router.use(createOrderRouter);
router.use(showOrderRouter);
router.use(cancelOrderRouter);

export { router as ordersRouter };
