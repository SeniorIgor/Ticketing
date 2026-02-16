import { DeliverPolicy } from 'nats';

import { OrderCancelledEvent, TicketStatuses, TicketUpdatedEvent } from '@org/contracts';
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
      ack_wait: 30_000_000_000,
      batchSize: 50,
      expiresMs: 2000,
      concurrency: 8,
    },
    async (data, ctx: MessageContext) => {
      const ticketId = data.ticket.id;
      const orderId = data.id;

      const updated = await Ticket.findOneAndUpdate(
        { _id: ticketId, status: TicketStatuses.Reserved, orderId },
        { $set: { status: TicketStatuses.Available }, $unset: { orderId: '' }, $inc: { version: 1 } },
        { new: true },
      );

      if (!updated) {
        const exists = await Ticket.findById(ticketId);
        if (!exists) {
          throw new RetryableError(`Ticket not found for cancel ticketId=${ticketId} orderId=${orderId}`);
        }

        // If sold, ignore cancel (payment won the race or refunds not supported).
        if (exists.status === TicketStatuses.Sold) {
          logger.info('[tickets] OrderCancelled ignored (ticket already sold)', { ticketId, orderId });
          return;
        }

        // Idempotent: already available => ok
        if (exists.status === TicketStatuses.Available) {
          logger.info('[tickets] OrderCancelled ignored (already available)', { ticketId, orderId });
          return;
        }

        // Reserved but by different order => retry
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

      logger.info('[tickets] Ticket unreserved by order cancel', { ticketId, orderId, ticketVersion: updated.version });
    },
    signal,
  );
}
