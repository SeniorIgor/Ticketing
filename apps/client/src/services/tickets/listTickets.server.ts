'use server';

import { cache } from 'react';

import { listTickets } from './listTickets';

export const listTicketsServer = cache(async (query?: Parameters<typeof listTickets>[0]) => {
  return listTickets(query);
});
