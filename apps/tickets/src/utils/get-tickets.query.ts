import type { QueryFilter } from 'mongoose';

import type { TicketDoc } from '../models/ticket';

import type { GetTicketsQuery } from './build-tickets-filter';

export function buildTicketsFilter(query: GetTicketsQuery): QueryFilter<TicketDoc> {
  const filter: QueryFilter<TicketDoc> = {};

  if (query.cursor) {
    filter._id = { $lt: query.cursor }; // assuming cursor already validated/cast
  }

  if (query.userId) {
    filter.userId = query.userId;
  }

  if (query.reserved === true) {
    filter.orderId = { $exists: true, $ne: null };
  } else if (query.reserved === false) {
    filter.$or = [{ orderId: { $exists: false } }, { orderId: null }];
  }

  if (query.q) {
    filter.title = { $regex: escapeRegex(query.q), $options: 'i' };
  }

  return filter;
}

function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
