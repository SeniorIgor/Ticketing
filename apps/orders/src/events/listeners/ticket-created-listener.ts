import { DeliverPolicy } from 'nats';

import { TicketCreatedEvent } from '@org/contracts';
import { createPullWorker, getNats, type MessageContext, Streams } from '@org/nats';

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
      logger.info('[orders] TicketCreated received', {
        subject: ctx.subject,
        seq: ctx.seq,
        delivered: ctx.delivered,
        ticketId: data.id,
        version: data.version,
      });

      // TODO: later you’ll implement the actual Orders logic here
      // e.g. update local read model, publish follow-up events, etc.
    },
    signal,
  );
}
