import { DeliverPolicy } from 'nats';

import { TicketUpdatedEvent } from '@org/contracts';
import { createPullWorker, getNats, type MessageContext, RetryableError, Streams } from '@org/nats';

import { Ticket } from '../../models';

const DURABLE_NAME = 'orders-ticket-updated';
const DELIVER_POLICY = process.env.NODE_ENV === 'production' ? DeliverPolicy.New : DeliverPolicy.All;

export async function startTicketUpdatedListener(signal?: AbortSignal) {
  const { logger } = getNats();

  return createPullWorker(
    {
      stream: Streams.Tickets,
      durable_name: DURABLE_NAME,
      def: TicketUpdatedEvent,

      ensure: true,
      deliver_policy: DELIVER_POLICY,

      batchSize: 50,
      expiresMs: 2000,
      concurrency: 8,
    },
    async (data, ctx: MessageContext) => {
      // ✅ Atomic "only apply if version-1 exists"
      const updated = await Ticket.findOneAndUpdate(
        { _id: data.id, version: data.version - 1 },
        {
          $set: { title: data.title, price: data.price, version: data.version },
        },
        { new: true },
      );

      if (!updated) {
        const alreadyApplied = await Ticket.exists({ _id: data.id, version: data.version });

        if (alreadyApplied) {
          logger.info('[orders] TicketUpdated ignored (duplicate)', { ticketId: data.id, version: data.version });
          return;
        }

        // Out-of-order / missing TicketCreated / duplicate timing → retry
        throw new RetryableError(
          `Ticket projection not ready for id=${data.id} incomingVersion=${data.version} 
          (expected stored version=${data.version - 1})`,
        );
      }

      logger.info('[orders] Ticket projection updated', {
        ticketId: data.id,
        version: updated.version,
        subject: ctx.subject,
        seq: ctx.seq,
        delivered: ctx.delivered,
      });
    },
    signal,
  );
}
