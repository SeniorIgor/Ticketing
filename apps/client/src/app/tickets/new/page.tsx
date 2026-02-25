import { CreateTicketForm } from '@/modules/tickets';

export default async function CreateTicketPage() {
  return (
    <div className="container py-4 d-flex align-items-start justify-content-center">
      <div style={{ width: 520 }}>
        <h1 className="mb-1">Sell a ticket</h1>
        <p className="text-muted mb-4">Create a new ticket listing.</p>
        <CreateTicketForm />
      </div>
    </div>
  );
}
