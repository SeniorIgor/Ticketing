import { DeliverPolicy } from 'nats';

import { OrderCancelledEvent, TicketUpdatedEvent } from '@org/contracts';
import { createPullWorker, getNats, type MessageContext, publishEvent, RetryableError, Streams } from '@org/nats';

import { Ticket } from '../../models/ticket';

const DURABLE_NAME = 'tickets-order-cancelled';
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

      ack_wait: 30_000, // 30s

      batchSize: 50,
      expiresMs: 2000,
      concurrency: 8,
    },
    async (data, ctx: MessageContext) => {
      const ticketId = data.ticket.id;
      const orderId = data.id;

      // Atomic: clear only if it is reserved by THIS order.
      const updated = await Ticket.findOneAndUpdate(
        { _id: ticketId, orderId },
        { $unset: { orderId: '' }, $inc: { version: 1 } },
        { new: true },
      );

      if (!updated) {
        // If already cleared -> idempotent ok.
        const exists = await Ticket.findById(ticketId);
        if (!exists) {
          throw new RetryableError(`Ticket not found for unreserve ticketId=${ticketId} orderId=${orderId}`);
        }

        if (!exists.orderId) {
          logger.info('[tickets] OrderCancelled ignored (already not reserved)', { ticketId, orderId });
          return;
        }

        // Reserved by another order -> weird ordering; retry.
        throw new RetryableError(
          `Ticket reserved by different order on cancel ticketId=${ticketId} 
          existingOrderId=${exists.orderId} incomingOrderId=${orderId}`,
        );
      }

      await publishEvent(
        TicketUpdatedEvent,
        {
          id: updated.id,
          title: updated.title,
          price: updated.price,
          userId: updated.userId,
          version: updated.version,
        },
        { correlationId: ctx.correlationId },
      );

      logger.info('[tickets] Ticket unreserved by order cancel', {
        ticketId,
        orderId,
        ticketVersion: updated.version,
        subject: ctx.subject,
        seq: ctx.seq,
      });
    },
    signal,
  );
}
