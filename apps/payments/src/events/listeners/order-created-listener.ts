import { DeliverPolicy } from 'nats';

import { OrderCreatedEvent } from '@org/contracts';
import { createPullWorker, getNats, type MessageContext, Streams } from '@org/nats';

import { Order } from '../../models';

const DURABLE_NAME = 'payments-order-created';
const DELIVER_POLICY = process.env.NODE_ENV === 'production' ? DeliverPolicy.New : DeliverPolicy.All;

export async function startOrderCreatedListener(signal?: AbortSignal) {
  const { logger } = getNats();

  return createPullWorker(
    {
      stream: Streams.Orders,
      durable_name: DURABLE_NAME,
      def: OrderCreatedEvent,
      ensure: true,
      deliver_policy: DELIVER_POLICY,
      ack_wait: 30_000_000_000,
      batchSize: 50,
      expiresMs: 2000,
      concurrency: 8,
    },
    async (data, ctx: MessageContext) => {
      const existing = await Order.findById(data.id);
      if (existing) {
        logger.info('[payments] OrderCreated ignored (already exists)', {
          orderId: data.id,
          existingVersion: existing.version,
          incomingVersion: data.version,
          subject: ctx.subject,
          seq: ctx.seq,
        });
        return;
      }

      const order = Order.build({
        id: data.id,
        userId: data.userId,
        status: data.status,
        price: data.ticket.price,
        version: data.version,
      });

      await order.save();

      logger.info('[payments] Order projection created', { orderId: data.id, seq: ctx.seq });
    },
    signal,
  );
}
