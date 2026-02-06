import { DeliverPolicy } from 'nats';

import { TicketCreatedEvent } from '@org/contracts';
import { createPullWorker, getNats, type MessageContext, Streams } from '@org/nats';

import { Ticket } from '../../models';

const DURABLE_NAME = 'orders-ticket-created';
const DELIVER_POLICY = process.env.NODE_ENV === 'production' ? DeliverPolicy.New : DeliverPolicy.All;

export async function startTicketCreatedListener(signal?: AbortSignal) {
  const { logger } = getNats();

  return createPullWorker(
    {
      stream: Streams.Tickets,
      durable_name: DURABLE_NAME,
      def: TicketCreatedEvent,

      ensure: true,
      deliver_policy: DELIVER_POLICY,

      batchSize: 50,
      expiresMs: 2000,
      concurrency: 8,
    },
    async (data, ctx: MessageContext) => {
      // Idempotent "create if missing"
      const existing = await Ticket.findById(data.id);

      if (existing) {
        logger.info('[orders] TicketCreated ignored (already exists)', {
          ticketId: data.id,
          existingVersion: existing.version,
          incomingVersion: data.version,
          subject: ctx.subject,
          seq: ctx.seq,
        });
        return;
      }

      const ticket = Ticket.build({
        id: data.id,
        title: data.title,
        price: data.price,
        version: data.version,
      });

      await ticket.save();

      logger.info('[orders] Ticket projection created', {
        ticketId: data.id,
        version: data.version,
        subject: ctx.subject,
        seq: ctx.seq,
      });
    },
    signal,
  );
}
