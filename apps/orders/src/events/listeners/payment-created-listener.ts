import { DeliverPolicy } from 'nats';

import { OrderCompletedEvent, PaymentCreatedEvent } from '@org/contracts';
import { createPullWorker, getNats, type MessageContext, publishEvent, RetryableError, Streams } from '@org/nats';

import { Order } from '../../models';

const DURABLE_NAME = 'orders-payment-created';
const DELIVER_POLICY = process.env.NODE_ENV === 'production' ? DeliverPolicy.New : DeliverPolicy.All;

export async function startPaymentCreatedListener(signal?: AbortSignal) {
  const { logger } = getNats();

  return createPullWorker(
    {
      stream: Streams.Payments,
      durable_name: DURABLE_NAME,
      def: PaymentCreatedEvent,

      ensure: true,
      deliver_policy: DELIVER_POLICY,

      ack_wait: 30_000_000_000, // 30s
      batchSize: 50,
      expiresMs: 2000,
      concurrency: 8,
    },
    async ({ orderId }, ctx: MessageContext) => {
      // Mark order complete only if it is still payable.
      // Atomic + version bump.
      const updated = await Order.applyCompleteFromEvent({ id: orderId });

      if (!updated) {
        const existing = await Order.findById(orderId);
        if (!existing) {
          throw new RetryableError(`Order not found for payment orderId=${orderId}`);
        }

        // Idempotency / race handling:
        // - if already Complete => duplicate payment event -> ignore
        // - if Cancelled => payment arrived too late -> ignore (but log)
        logger.info('[orders] PaymentCreated ignored (not completable)', {
          orderId,
          currentStatus: existing.status,
          subject: ctx.subject,
          seq: ctx.seq,
          correlationId: ctx.correlationId,
        });

        return;
      }

      await publishEvent(
        OrderCompletedEvent,
        { id: updated.id, userId: updated.userId, version: updated.version },
        { correlationId: ctx.correlationId },
      );

      logger.info('[orders] Order completed from payment', {
        orderId: updated.id,
        orderVersion: updated.version,
        subject: ctx.subject,
        seq: ctx.seq,
        correlationId: ctx.correlationId,
      });
    },
    signal,
  );
}
