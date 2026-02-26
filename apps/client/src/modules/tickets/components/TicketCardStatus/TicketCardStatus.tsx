import type { TicketStatus } from '@/services/tickets';

interface TicketStatusProps {
  status: TicketStatus;
}

export function TicketCardStatus({ status }: TicketStatusProps) {
  if (status === 'available') {
    return <span className="badge text-bg-success">Available</span>;
  }

  if (status === 'reserved') {
    return <span className="badge text-bg-warning">Reserved</span>;
  }

  if (status === 'sold') {
    return <span className="badge text-bg-secondary">Sold</span>;
  }

  return <span className="badge text-bg-light">{status}</span>;
}
