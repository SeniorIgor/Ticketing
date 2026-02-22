import { DeliverPolicy } from 'nats';

import { OrderCreatedEvent, TicketStatuses, TicketUpdatedEvent } from '@org/contracts';
import { createPullWorker, getNats, type MessageContext, publishEvent, RetryableError, Streams } from '@org/nats';

import { Ticket } from '../../models/ticket';

const DURABLE_NAME = 'tickets-order-created';
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
      const ticketId = data.ticket.id;
      const orderId = data.id;

      // Reserve only if currently Available
      const updated = await Ticket.findOneAndUpdate(
        { _id: ticketId, status: TicketStatuses.Available },
        { $set: { status: TicketStatuses.Reserved, orderId }, $inc: { version: 1 } },
        { new: true },
      );

      if (!updated) {
        const exists = await Ticket.findById(ticketId);
        if (!exists) {
          throw new RetryableError(`Ticket not found for reservation ticketId=${ticketId} orderId=${orderId}`);
        }

        // Idempotent: if already reserved by same order, ignore.
        if (exists.status === TicketStatuses.Reserved && exists.orderId === orderId) {
          logger.info('[tickets] OrderCreated ignored (already reserved by same order)', { ticketId, orderId });
          return;
        }

        throw new RetryableError(
          `Ticket not available for reservation ticketId=${ticketId} status=${exists.status} 
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
          orderId: updated.orderId,
        },
        { correlationId: ctx.correlationId },
      );

      logger.info('[tickets] Ticket reserved by order', { ticketId, orderId, ticketVersion: updated.version });
    },
    signal,
  );
}
