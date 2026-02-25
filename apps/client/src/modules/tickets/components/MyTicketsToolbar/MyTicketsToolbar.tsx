'use client';

import { ROUTES } from '@/constants';
import type { TicketStatus } from '@/services/tickets';

import { TicketsToolbar } from '../TicketsToolbar/TicketsToolbar';

type Props = {
  initialQuery: string;
  total: number;
  initialStatus?: TicketStatus[];
};

export function MyTicketsToolbar({ initialQuery, total, initialStatus }: Props) {
  return (
    <TicketsToolbar
      initialQuery={initialQuery}
      total={total}
      initialStatus={initialStatus}
      basePath={ROUTES.tickets.mine}
    />
  );
}
