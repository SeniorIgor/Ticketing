import type { QueryFilter } from 'mongoose';

import type { TicketDoc } from '../models/ticket';

import type { GetTicketsQuery } from './get-tickets-query.schema';

export function buildTicketsFilter(query: GetTicketsQuery): QueryFilter<TicketDoc> {
  const filter: QueryFilter<TicketDoc> = {};

  if (query.cursor) {
    filter._id = { $lt: query.cursor };
  }

  if (query.userId) {
    filter.userId = query.userId;
  }

  if (query.status?.length) {
    // query.status is TicketStatus[] (typed by schema)
    filter.status = { $in: query.status };
  }

  if (query.q) {
    filter.title = { $regex: escapeRegex(query.q), $options: 'i' };
  }

  return filter;
}

function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
