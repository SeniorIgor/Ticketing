import { HomeHero, QuickActions, TicketsSection } from '@/modules/home';
import { listTicketsServer, TicketStatuses } from '@/services/tickets';

export default async function HomePage() {
  const ticketsRes = await listTicketsServer({ limit: 3, status: [TicketStatuses.Available] });

  const ticketsResult = ticketsRes.ok ? { ok: true as const, tickets: ticketsRes.data.items } : { ok: false as const };

  return (
    <div className="container py-4">
      <HomeHero />
      <QuickActions />
      <TicketsSection ticketsResult={ticketsResult} />
    </div>
  );
}
