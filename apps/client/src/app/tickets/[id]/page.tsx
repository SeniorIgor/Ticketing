import { notFound } from 'next/navigation';

import { TicketDetailsCard } from '@/modules/tickets/components';
import { getCurrentUserServer, getTicketServer } from '@/services';

type Params = { id: string };

type TicketDetailsPageProps = {
  params: Params | Promise<Params>;
};

export default async function TicketDetailsPage({ params }: TicketDetailsPageProps) {
  const { id } = await params;

  const [userRes, ticketRes] = await Promise.all([getCurrentUserServer(), getTicketServer(id)]);
  const isAuthed = userRes.ok && !!userRes.data.currentUser;

  if (!ticketRes.ok) {
    // Map common backend cases
    if (ticketRes.error.status === 404) {
      notFound();
    }

    if (ticketRes.error.status === 400) {
      // Invalid ObjectId or validation error
      return (
        <div className="container py-4">
          <div className="alert alert-warning">
            <div className="fw-semibold mb-1">Invalid ticket id</div>
            <div className="text-muted">Please open the ticket from the tickets list.</div>
          </div>
        </div>
      );
    }

    // Let error boundary handle other unexpected errors
    throw ticketRes.error;
  }

  return (
    <div className="container py-4">
      <TicketDetailsCard ticket={ticketRes.data} isAuthed={isAuthed} />
    </div>
  );
}
