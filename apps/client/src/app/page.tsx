import { HomeHero, QuickActions, TicketsSection } from '@/modules/home/components';
import { getCurrentUserServer, listTicketsServer } from '@/services';

export default async function HomePage() {
  const [userRes, ticketsRes] = await Promise.all([getCurrentUserServer(), listTicketsServer({ limit: 3 })]);

  const isAuthed = userRes.ok && !!userRes.data.currentUser;

  const ticketsResult = ticketsRes.ok ? { ok: true as const, tickets: ticketsRes.data.items } : { ok: false as const };

  return (
    <div className="container py-4">
      <HomeHero isAuthed={isAuthed} />
      <QuickActions isAuthed={isAuthed} />
      <TicketsSection ticketsResult={ticketsResult} isAuthed={isAuthed} />
    </div>
  );
}
