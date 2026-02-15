import { DeliverPolicy } from 'nats';

import { OrderCompletedEvent } from '@org/contracts';
import { createPullWorker, getNats, type MessageContext, RetryableError, Streams } from '@org/nats';

import { Order } from '../../models/order';

const DURABLE_NAME = 'payments-order-completed';
const DELIVER_POLICY = process.env.NODE_ENV === 'production' ? DeliverPolicy.New : DeliverPolicy.All;

export async function startOrderCompletedListener(signal?: AbortSignal) {
  const { logger } = getNats();

  return createPullWorker(
    {
      stream: Streams.Orders,
      durable_name: DURABLE_NAME,
      def: OrderCompletedEvent,

      ensure: true,
      deliver_policy: DELIVER_POLICY,

      ack_wait: 30_000_000_000, // 30s
      batchSize: 50,
      expiresMs: 2000,
      concurrency: 8,
    },
    async ({ id, version }, ctx: MessageContext) => {
      const updated = await Order.applyCompletedFromEvent({ id, version });

      if (!updated) {
        // duplicate (already applied)
        const alreadyApplied = await Order.exists({ _id: id, version });
        if (alreadyApplied) {
          logger.info('[payments] OrderCompleted ignored (duplicate)', { orderId: id, version });
          return;
        }

        // out-of-order / projection missing
        throw new RetryableError(
          `Order projection not ready id=${id} incomingVersion=${version} expected=${version - 1}`,
        );
      }

      logger.info('[payments] Order projection completed', { orderId: id, seq: ctx.seq });
    },
    signal,
  );
}
