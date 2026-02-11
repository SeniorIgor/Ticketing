import type { Queue } from 'bullmq';
import { DeliverPolicy } from 'nats';

import { OrderCreatedEvent } from '@org/contracts';
import { createPullWorker, getNats, type MessageContext, Streams } from '@org/nats';

import { scheduleExpiration } from '../../queue';

const DURABLE_NAME = 'expiration-order-created';
const DELIVER_POLICY = process.env.NODE_ENV === 'production' ? DeliverPolicy.New : DeliverPolicy.All;

interface StartOrderCreatedListenerDeps {
  queue: Queue;
}

export async function startOrderCreatedListener(deps: StartOrderCreatedListenerDeps, signal?: AbortSignal) {
  const { logger } = getNats();

  return createPullWorker(
    {
      stream: Streams.Orders,
      durable_name: DURABLE_NAME,
      def: OrderCreatedEvent,

      ensure: true,
      deliver_policy: DELIVER_POLICY,

      ack_wait: 30_000_000_000, // 30s

      batchSize: 50,
      expiresMs: 2000,
      concurrency: 8,
    },
    async (data, ctx: MessageContext) => {
      await scheduleExpiration({
        queue: deps.queue,
        orderId: data.id,
        expiresAt: data.expiresAt,
        correlationId: ctx.correlationId,
      });

      logger.info('[expiration] expiration scheduled', {
        orderId: data.id,
        expiresAt: data.expiresAt,
        subject: ctx.subject,
        seq: ctx.seq,
      });
    },
    signal,
  );
}
