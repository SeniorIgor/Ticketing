import Link from 'next/link';

import { ROUTES } from '@/constants';

export default function TicketNotFound() {
  return (
    <div className="container py-4">
      <div className="alert alert-info">
        <div className="fw-semibold mb-1">Ticket not found</div>
        <div className="text-muted mb-3">It may have been removed or the link is incorrect.</div>
        <Link href={ROUTES.tickets.root} className="btn btn-outline-primary">
          Back to tickets
        </Link>
      </div>
    </div>
  );
}
