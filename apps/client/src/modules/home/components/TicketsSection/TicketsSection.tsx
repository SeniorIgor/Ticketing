import Link from 'next/link';

import { TicketsList } from '@/modules/tickets/components';
import type { TicketDto } from '@/services';

type TicketsSectionProps = {
  ticketsResult: { ok: true; tickets: TicketDto[] } | { ok: false };
  isAuthed: boolean;
};

export function TicketsSection({ ticketsResult, isAuthed }: TicketsSectionProps) {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="h4 mb-0">Latest tickets</h2>
        <Link href="/tickets" className="btn btn-sm btn-outline-secondary">
          View all
        </Link>
      </div>

      {!ticketsResult.ok ? (
        <div className="alert alert-danger mb-0">
          <div className="fw-semibold">Couldn’t load tickets</div>
          <div className="text-muted small">Please try again in a moment.</div>
        </div>
      ) : ticketsResult.tickets.length === 0 ? (
        <div className="card border shadow-sm">
          <div className="card-body">
            <div className="fw-semibold mb-1">No tickets yet</div>
            <div className="text-muted mb-3">Be the first to list a ticket for sale.</div>
            {isAuthed ? (
              <Link href="/tickets/new" className="btn btn-success">
                Sell a ticket
              </Link>
            ) : (
              <Link href="/signup" className="btn btn-primary">
                Create account to sell
              </Link>
            )}
          </div>
        </div>
      ) : (
        <TicketsList tickets={ticketsResult.tickets} />
      )}
    </div>
  );
}
