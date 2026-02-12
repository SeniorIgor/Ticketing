import { DeliverPolicy } from 'nats';

import { OrderCancelledEvent, OrderExpiredEvent } from '@org/contracts';
import { createPullWorker, getNats, type MessageContext, publishEvent, RetryableError, Streams } from '@org/nats';

import { Order } from '../../models';
import { OrderStatus } from '../../types';

const DURABLE_NAME = 'orders-order-expired';
const DELIVER_POLICY = process.env.NODE_ENV === 'production' ? DeliverPolicy.New : DeliverPolicy.All;

export async function startOrderExpiredListener(signal?: AbortSignal) {
  const { logger } = getNats();

  return createPullWorker(
    {
      stream: Streams.Expiration, // or Streams.Orders if you publish it there; but better: Streams.Expiration
      durable_name: DURABLE_NAME,
      def: OrderExpiredEvent,

      ensure: true,
      deliver_policy: DELIVER_POLICY,

      ack_wait: 30_000_000_000, // 30s
      batchSize: 50,
      expiresMs: 2000,
      concurrency: 8,
    },
    async (data, ctx: MessageContext) => {
      const orderId = data.orderId;

      // Atomic: cancel only if still active (not Complete, not Cancelled).
      const updated = await Order.findOneAndUpdate(
        { _id: orderId, status: { $in: [OrderStatus.Created, OrderStatus.AwaitingPayment] } },
        { $set: { status: OrderStatus.Cancelled } },
        { new: true },
      );

      // Idempotent: already cancelled or already complete => nothing to do.
      if (!updated) {
        const exists = await Order.findById(orderId);
        if (!exists) {
          // In theory order must exist, but startup races / dev DB resets happen.
          throw new RetryableError(`Order not found for expiration orderId=${orderId}`);
        }

        logger.info('[orders] OrderExpired ignored (not cancellable)', {
          orderId,
          currentStatus: exists.status,
          subject: ctx.subject,
          seq: ctx.seq,
        });
        return;
      }

      // Publish OrderCancelled so Tickets service unreserves
      await publishEvent(
        OrderCancelledEvent,
        {
          id: updated.id,
          userId: updated.userId,
          version: updated.version,
          ticket: { id: updated.ticket.toString() },
        },
        { correlationId: ctx.correlationId },
      );

      logger.info('[orders] Order expired -> cancelled', {
        orderId,
        orderVersion: updated.version,
        subject: ctx.subject,
        seq: ctx.seq,
      });
    },
    signal,
  );
}
