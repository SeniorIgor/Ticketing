import { TicketsSkeleton } from '@/modules/tickets/components';

export default function LoadingTicketsPage() {
  return (
    <div className="container py-4">
      <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap">
        <div>
          <h1 className="mb-1">All tickets</h1>
          <p className="text-muted mb-0">Loading listings…</p>
        </div>
      </div>

      <hr className="my-4" />

      <TicketsSkeleton />
    </div>
  );
}
