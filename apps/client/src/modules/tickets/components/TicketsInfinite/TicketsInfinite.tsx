'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { TicketDto } from '@/services';
import { listTickets } from '@/services';

import { TicketsList } from '../TicketsList/TicketsList';

type Props = {
  initialItems: TicketDto[];
  initialNextCursor?: string;
  initialHasNextPage: boolean;
  query?: string;
  userId?: string;
};

export function TicketsInfinite({ initialItems, initialNextCursor, initialHasNextPage, query, userId }: Props) {
  const [items, setItems] = useState(initialItems);
  const [nextCursor, setNextCursor] = useState<string | undefined>(initialNextCursor);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const [loading, setLoading] = useState(false);

  // Reset when query/userId changes (navigation updates props)
  useEffect(() => {
    setItems(initialItems);
    setNextCursor(initialNextCursor);
    setHasNextPage(initialHasNextPage);
  }, [initialItems, initialNextCursor, initialHasNextPage]);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (!hasNextPage || loading) {
      return;
    }
    setLoading(true);

    const res = await listTickets({
      limit: 20,
      cursor: nextCursor,
      q: query || undefined,
      userId: userId || undefined,
    });

    if (res.ok) {
      setItems((prev) => [...prev, ...res.data.items]);
      setHasNextPage(res.data.pageInfo.hasNextPage);
      setNextCursor(res.data.pageInfo.nextCursor);
    }

    setLoading(false);
  }, [hasNextPage, loading, nextCursor, query, userId]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) {
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '600px' },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [loadMore]);

  return (
    <>
      <TicketsList tickets={items} />

      <div ref={sentinelRef} />

      {loading && <div className="text-muted small mt-3">Loading more…</div>}

      {!hasNextPage && items.length > 0 && <div className="text-muted small mt-3">You reached the end.</div>}
    </>
  );
}
