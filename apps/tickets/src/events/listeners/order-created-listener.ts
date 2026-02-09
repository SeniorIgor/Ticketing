import { DeliverPolicy } from 'nats';

import { OrderCreatedEvent, TicketUpdatedEvent } from '@org/contracts';
import { createPullWorker, getNats, type MessageContext, publishEvent, RetryableError, Streams } from '@org/nats';

import { Ticket } from '../../models';

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

      ack_wait: 30_000, // 30s

      batchSize: 50,
      expiresMs: 2000,
      concurrency: 8,
    },
    async (data, ctx: MessageContext) => {
      const ticketId = data.ticket.id;
      const orderId = data.id;

      // Atomic: reserve only if not reserved yet.
      // If already reserved by SAME order -> idempotent ok.
      // If reserved by DIFFERENT order -> something is off; retry (could be out-of-order cancel etc.)
      const updated = await Ticket.findOneAndUpdate(
        { _id: ticketId, $or: [{ orderId: { $exists: false } }, { orderId: null }] },
        { $set: { orderId }, $inc: { version: 1 } },
        { new: true },
      );

      if (!updated) {
        const exists = await Ticket.findById(ticketId);
        if (!exists) {
          // tickets service should always have the ticket, but startup races happen in dev.
          throw new RetryableError(`Ticket not found for reservation ticketId=${ticketId} orderId=${orderId}`);
        }

        if (exists.orderId === orderId) {
          logger.info('[tickets] OrderCreated ignored (already reserved by same order)', { ticketId, orderId });
          return;
        }

        throw new RetryableError(
          `Ticket already reserved by another order ticketId=${ticketId} 
          existingOrderId=${exists.orderId} incomingOrderId=${orderId}`,
        );
      }

      // Publish TicketUpdated so other services learn reservation state
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

      logger.info('[tickets] Ticket reserved by order', {
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
