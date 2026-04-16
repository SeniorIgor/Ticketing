import type { DeliverPolicy } from 'nats';

import { Streams, Subjects } from '@org/nats';

export type TopologyStream = {
  stream: (typeof Streams)[keyof typeof Streams];
  subjects: string[];
};

export type TopologyConsumer = {
  stream: (typeof Streams)[keyof typeof Streams];
  durable_name: string;
  filter_subjects: string[];
  deliver_policy: DeliverPolicy;
  ack_wait: number; // nanoseconds
};

export const STREAMS: TopologyStream[] = [
  { stream: Streams.Expiration, subjects: ['expiration.*'] },
  { stream: Streams.Orders, subjects: ['orders.*'] },
  { stream: Streams.Payments, subjects: ['payments.*'] },
  { stream: Streams.Tickets, subjects: ['tickets.*'] },
];

// Keep durable names aligned with consumers in each service.
// (Search for `const DURABLE_NAME =` in the apps.)
export function buildConsumers(deliver_policy: DeliverPolicy): TopologyConsumer[] {
  const ack_wait = 30_000_000_000; // 30s

  return [
    // expiration service consumes orders.created
    {
      stream: Streams.Orders,
      durable_name: 'expiration-order-created',
      filter_subjects: [Subjects.OrderCreated],
      deliver_policy,
      ack_wait,
    },

    // orders service consumes expiration.order-expired
    {
      stream: Streams.Expiration,
      durable_name: 'orders-order-expired',
      filter_subjects: [Subjects.OrderExpired],
      deliver_policy,
      ack_wait,
    },
    // orders service consumes payments.created
    {
      stream: Streams.Payments,
      durable_name: 'orders-payment-created',
      filter_subjects: [Subjects.PaymentCreated],
      deliver_policy,
      ack_wait,
    },
    // orders service consumes tickets.*
    {
      stream: Streams.Tickets,
      durable_name: 'orders-ticket-created',
      filter_subjects: [Subjects.TicketCreated],
      deliver_policy,
      ack_wait,
    },
    {
      stream: Streams.Tickets,
      durable_name: 'orders-ticket-updated',
      filter_subjects: [Subjects.TicketUpdated],
      deliver_policy,
      ack_wait,
    },

    // payments service consumes orders.*
    {
      stream: Streams.Orders,
      durable_name: 'payments-order-cancelled',
      filter_subjects: [Subjects.OrderCancelled],
      deliver_policy,
      ack_wait,
    },
    {
      stream: Streams.Orders,
      durable_name: 'payments-order-completed',
      filter_subjects: [Subjects.OrderCompleted],
      deliver_policy,
      ack_wait,
    },
    {
      stream: Streams.Orders,
      durable_name: 'payments-order-created',
      filter_subjects: [Subjects.OrderCreated],
      deliver_policy,
      ack_wait,
    },

    // tickets service consumes orders.*
    {
      stream: Streams.Orders,
      durable_name: 'tickets-order-cancelled',
      filter_subjects: [Subjects.OrderCancelled],
      deliver_policy,
      ack_wait,
    },
    {
      stream: Streams.Orders,
      durable_name: 'tickets-order-completed',
      filter_subjects: [Subjects.OrderCompleted],
      deliver_policy,
      ack_wait,
    },
    {
      stream: Streams.Orders,
      durable_name: 'tickets-order-created',
      filter_subjects: [Subjects.OrderCreated],
      deliver_policy,
      ack_wait,
    },
  ];
}
