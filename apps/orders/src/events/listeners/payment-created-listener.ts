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
      ack_wait: 30_000_000_000,
      batchSize: 50,
      expiresMs: 2000,
      concurrency: 8,
    },
    async ({ orderId }, ctx: MessageContext) => {
      const updated = await Order.applyCompleteFromEvent({ id: orderId });

      if (!updated) {
        const existing = await Order.findById(orderId);
        if (!existing) {
          throw new RetryableError(`Order not found for payment orderId=${orderId}`);
        }

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
        {
          id: updated.id,
          userId: updated.userId,
          version: updated.version,
          ticket: { id: updated.ticket.toString() },
        },
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
