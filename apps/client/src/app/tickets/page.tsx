import Link from 'next/link';

import { ROUTES } from '@/constants';
import { TicketsCreateButton, TicketsInfinite, TicketsToolbar } from '@/modules/tickets';
import { listTicketsServer } from '@/services/tickets';
import type { SearchParams } from '@/utils';
import { getSearchQuery } from '@/utils';

type Props = { searchParams?: SearchParams | Promise<SearchParams> };

export default async function TicketsPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const query = getSearchQuery(resolvedSearchParams);

  const ticketsRes = await listTicketsServer({ limit: 20, q: query || undefined });

  if (!ticketsRes.ok) {
    return (
      <div className="container py-4">
        <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap">
          <div>
            <h1 className="mb-1">All tickets</h1>
            <p className="text-muted mb-0">Browse all available listings.</p>
          </div>

          <TicketsCreateButton />
        </div>

        <hr className="my-4" />
        <div className="alert alert-danger mb-0">Failed to load tickets. Please try again later.</div>
      </div>
    );
  }

  const page = ticketsRes.data;

  return (
    <div className="container py-4">
      <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap">
        <div>
          <h1 className="mb-1">All tickets</h1>
          <p className="text-muted mb-0">Browse all available listings.</p>
        </div>

        <TicketsCreateButton />
      </div>

      <hr className="my-4" />

      <TicketsToolbar initialQuery={query} total={page.items.length} />

      <div className="mt-3">
        <TicketsInfinite
          initialItems={page.items}
          initialNextCursor={page.pageInfo.nextCursor}
          initialHasNextPage={page.pageInfo.hasNextPage}
          query={query}
        />
      </div>

      <div className="mt-4">
        <Link href={ROUTES.home} className="btn btn-link px-0">
          Back to home
        </Link>
      </div>
    </div>
  );
}
