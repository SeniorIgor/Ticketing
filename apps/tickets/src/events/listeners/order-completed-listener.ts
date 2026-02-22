import { DeliverPolicy } from 'nats';

import { OrderCompletedEvent, TicketStatuses, TicketUpdatedEvent } from '@org/contracts';
import { createPullWorker, getNats, type MessageContext, publishEvent, RetryableError, Streams } from '@org/nats';

import { Ticket } from '../../models/ticket';

const DURABLE_NAME = 'tickets-order-completed';
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
      ack_wait: 30_000_000_000,
      batchSize: 50,
      expiresMs: 2000,
      concurrency: 8,
    },
    async (data, ctx: MessageContext) => {
      const orderId = data.id;
      const ticketId = data.ticket.id;

      const updated = await Ticket.findOneAndUpdate(
        { _id: ticketId, status: TicketStatuses.Reserved, orderId },
        { $set: { status: TicketStatuses.Sold }, $inc: { version: 1 } },
        { new: true },
      );

      if (!updated) {
        const exists = await Ticket.findById(ticketId);
        if (!exists) {
          throw new RetryableError(`Ticket not found for complete ticketId=${ticketId} orderId=${orderId}`);
        }

        // Idempotent: already sold
        if (exists.status === TicketStatuses.Sold) {
          logger.info('[tickets] OrderCompleted ignored (already sold)', { ticketId, orderId });
          return;
        }

        // If already available => out-of-order events -> retry
        if (exists.status === TicketStatuses.Available) {
          throw new RetryableError(
            `Ticket is available on complete (out-of-order) ticketId=${ticketId} orderId=${orderId}`,
          );
        }

        // Reserved by different order => retry
        throw new RetryableError(
          `Ticket reserved by different order on complete ticketId=${ticketId} 
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

      logger.info('[tickets] Ticket marked sold by order completed', {
        ticketId,
        orderId,
        ticketVersion: updated.version,
      });
    },
    signal,
  );
}
