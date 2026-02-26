'use server';

import { cache } from 'react';

import { getTicket } from './getTicket';

export const getTicketServer = cache(getTicket);
