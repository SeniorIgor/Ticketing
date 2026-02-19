'use client';

import { type FormEvent, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type TicketsToolbarProps = {
  initialQuery: string;
  total: number;
};

export function TicketsToolbar({ initialQuery, total }: TicketsToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(initialQuery);

  // Keep input in sync if user navigates back/forward
  useEffect(() => {
    const current = (searchParams.get('q') ?? '').trim();
    setQ(current);
  }, [searchParams]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();

    const query = q.trim();
    const params = new URLSearchParams(searchParams.toString());

    if (query) {
      params.set('q', query);
    } else {
      params.delete('q');
    }

    const qs = params.toString();
    router.push(qs ? `/tickets?${qs}` : '/tickets');
  }

  function onClear() {
    setQ('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('q');
    const qs = params.toString();
    router.push(qs ? `/tickets?${qs}` : '/tickets');
  }

  return (
    <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
      <form className="d-flex gap-2 flex-grow-1" style={{ maxWidth: 560 }} onSubmit={onSubmit}>
        <input
          className="form-control"
          placeholder="Search by title…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="btn btn-primary" type="submit">
          Search
        </button>
        <button className="btn btn-outline-secondary" type="button" onClick={onClear} disabled={!q.trim()}>
          Clear
        </button>
      </form>

      <div className="text-muted small">
        Showing <strong>{total}</strong> tickets
      </div>
    </div>
  );
}
