'use client';

import type { TicketStatus } from '@/services/tickets';
import { TicketStatuses } from '@/services/tickets';

import { useTicketsToolbar } from '../../hooks/useTicketsToolbar';

type TicketsToolbarProps = {
  initialQuery: string;
  total: number;
  initialStatus?: TicketStatus[];
  /**
   * Route where this toolbar lives.
   * - "/tickets" (default)
   * - "/tickets/mine"
   */
  basePath?: string;
};

const ALL: readonly TicketStatus[] = [TicketStatuses.Available, TicketStatuses.Reserved, TicketStatuses.Sold] as const;
const DEFAULT_STATUS: TicketStatus[] = [TicketStatuses.Available];

export function TicketsToolbar({ initialQuery, total, initialStatus, basePath = '/tickets' }: TicketsToolbarProps) {
  const { q, setQ, status, statusLabel, onSubmit, onClear, toggleStatus, setAllStatuses } = useTicketsToolbar({
    initialQuery,
    initialStatus: initialStatus ?? DEFAULT_STATUS,
    all: ALL,
    defaultStatus: DEFAULT_STATUS,
    basePath,
  });

  const isAllActive = status.length === ALL.length;

  return (
    <div className="d-flex flex-column gap-3">
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
          Showing <strong>{total}</strong> tickets · Status: <strong>{statusLabel}</strong>
        </div>
      </div>

      <div className="d-flex align-items-center gap-2 flex-wrap">
        <div className="text-muted small me-2">Filter:</div>

        <button
          type="button"
          className={isAllActive ? 'btn btn-sm btn-secondary' : 'btn btn-sm btn-outline-secondary'}
          onClick={setAllStatuses}
        >
          All
        </button>

        {ALL.map((s) => {
          const active = status.includes(s);
          return (
            <button
              key={s}
              type="button"
              className={active ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-outline-primary'}
              onClick={() => toggleStatus(s)}
            >
              {s}
            </button>
          );
        })}
      </div>
    </div>
  );
}
