import { DeliverPolicy } from 'nats';

import { OrderCancelledEvent } from '@org/contracts';
import { createPullWorker, getNats, type MessageContext, RetryableError, Streams } from '@org/nats';

import { Order } from '../../models/order';

const DURABLE_NAME = 'payments-order-cancelled';
const DELIVER_POLICY = process.env.NODE_ENV === 'production' ? DeliverPolicy.New : DeliverPolicy.All;

export async function startOrderCancelledListener(signal?: AbortSignal) {
  const { logger } = getNats();

  return createPullWorker(
    {
      stream: Streams.Orders,
      durable_name: DURABLE_NAME,
      def: OrderCancelledEvent,
      ensure: true,
      deliver_policy: DELIVER_POLICY,
      ack_wait: 30_000_000_000,
      batchSize: 50,
      expiresMs: 2000,
      concurrency: 8,
    },
    async ({ id, version }, ctx: MessageContext) => {
      const updated = await Order.applyCancelledFromEvent({ id, version });

      if (!updated) {
        const alreadyApplied = await Order.exists({ _id: id, version });
        if (alreadyApplied) {
          logger.info('[payments] OrderCancelled ignored (duplicate)', { orderId: id, version });
          return;
        }

        throw new RetryableError(
          `Order projection not ready id=${id} incomingVersion=${version} expected=${version - 1}`,
        );
      }

      logger.info('[payments] Order projection cancelled', { orderId: id, seq: ctx.seq });
    },
    signal,
  );
}
