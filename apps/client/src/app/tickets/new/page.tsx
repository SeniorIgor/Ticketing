import { redirect } from 'next/navigation';

import { ROUTES } from '@/constants';
import { CreateTicketForm } from '@/modules/tickets/components';
import { getCurrentUserServer } from '@/services';

export default async function CreateTicketPage() {
  const userRes = await getCurrentUserServer();
  if (!userRes.ok || !userRes.data.currentUser) {
    redirect(ROUTES.signIn);
  }

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
