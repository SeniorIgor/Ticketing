import type { TicketDto } from '@/services/tickets';

import { TicketCard } from '../TicketCard/TicketCard';

interface TicketsListProps {
  tickets: TicketDto[];
}

export function TicketsList({ tickets }: TicketsListProps) {
  if (tickets.length === 0) {
    return <div className="alert alert-info mb-0">No tickets yet. Be the first one to sell a ticket!</div>;
  }

  return (
    <div className="row g-3">
      {tickets.map((ticket) => (
        <div key={ticket.id} className="col-12 col-md-6 col-lg-4">
          <TicketCard {...ticket} />
        </div>
      ))}
    </div>
  );
}
