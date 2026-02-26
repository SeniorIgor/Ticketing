import Link from 'next/link';
import { redirect } from 'next/navigation';

import { ROUTES } from '@/constants';
import { MyTicketsToolbar, TicketsInfinite } from '@/modules/tickets/components';
import { getCurrentUserServer } from '@/services/auth';
import { listTicketsServer, TicketStatuses } from '@/services/tickets';
import { getStatusFromSearchParams } from '@/utils';

type SearchParams = Record<string, string | string[] | undefined>;
type Props = { searchParams?: SearchParams | Promise<SearchParams> };

function getQuery(sp?: SearchParams) {
  const raw = sp?.q;
  const q = Array.isArray(raw) ? raw[0] : raw;
  return (q ?? '').trim();
}

export default async function MyTicketsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = getQuery(sp);
  const status = getStatusFromSearchParams(sp) ?? [TicketStatuses.Available];

  const userRes = await getCurrentUserServer();
  if (!userRes.ok || !userRes.data.currentUser) {
    redirect(ROUTES.signIn);
  }

  const userId = userRes.data.currentUser.id;

  const ticketsRes = await listTicketsServer({ limit: 20, userId, q: q || undefined, status });

  if (!ticketsRes.ok) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger mb-0">Failed to load your tickets.</div>
      </div>
    );
  }

  const page = ticketsRes.data;

  return (
    <div className="container py-4">
      <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap">
        <div>
          <h1 className="mb-1">My tickets</h1>
          <p className="text-muted mb-0">Tickets you created.</p>
        </div>

        <Link href={ROUTES.tickets.new} className="btn btn-success">
          Sell a ticket
        </Link>
      </div>

      <hr className="my-4" />

      <MyTicketsToolbar initialQuery={q} total={page.items.length} initialStatus={status} />

      <div className="mt-3">
        <TicketsInfinite
          initialItems={page.items}
          initialNextCursor={page.pageInfo.nextCursor}
          initialHasNextPage={page.pageInfo.hasNextPage}
          query={q}
          userId={userId}
          status={status}
        />
      </div>
    </div>
  );
}
