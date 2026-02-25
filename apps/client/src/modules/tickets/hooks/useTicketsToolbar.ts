'use client';

import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function isSameArray<T extends string>(a: readonly T[], b: readonly T[]) {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

export function useTicketsToolbar<TStatus extends string>({
  initialQuery,
  initialStatus,
  all,
  defaultStatus,
  basePath,
}: {
  initialQuery: string;
  initialStatus: TStatus[];
  all: readonly TStatus[];
  defaultStatus: TStatus[];
  basePath: string; // e.g. "/tickets" or "/tickets/mine"
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(initialQuery);
  const [status, setStatus] = useState<TStatus[]>(initialStatus);

  const searchParamsString = searchParams.toString();

  // Derive state from URL (single source of truth when user navigates back/forward).
  const urlState = useMemo(() => {
    const params = new URLSearchParams(searchParamsString);

    const nextQ = (params.get('q') ?? '').trim();
    const rawStatuses = params.getAll('status').map((v) => v.trim());
    const filteredStatuses = rawStatuses.filter((v): v is TStatus => (all as readonly string[]).includes(v));

    // UX rule:
    // - missing "status" params => defaultStatus
    // - "All" is explicit (we will write all statuses into URL)
    const nextStatus = filteredStatuses.length ? filteredStatuses : defaultStatus;

    return { q: nextQ, status: nextStatus };
  }, [searchParamsString, all, defaultStatus]);

  const pushParams = useCallback(
    (next: { q?: string; status?: TStatus[] }) => {
      const params = new URLSearchParams(searchParamsString);

      // q
      if (next.q && next.q.trim()) {
        params.set('q', next.q.trim());
      } else {
        params.delete('q');
      }

      // status (repeatable)
      params.delete('status');
      const nextStatus = next.status ?? [];

      // Keep URL clean only for the DEFAULT selection.
      // "All" must be explicit, otherwise it collapses to defaultStatus.
      const shouldOmitStatus = nextStatus.length === 0 || isSameArray(nextStatus, defaultStatus);
      if (!shouldOmitStatus) {
        for (const s of nextStatus) {
          params.append('status', s);
        }
      }

      const qs = params.toString();
      router.push(qs ? `${basePath}?${qs}` : basePath);
    },
    [searchParamsString, router, basePath, defaultStatus],
  );

  // Sync local state when URL changes (back/forward, external navigation)
  useEffect(() => {
    setQ(urlState.q);
    setStatus(urlState.status);
  }, [urlState]);

  const statusLabel = useMemo(() => {
    if (!status.length || status.length === all.length) {
      return 'All';
    }
    return status.join(', ');
  }, [status, all.length]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    pushParams({ q, status });
  }

  function onClear() {
    setQ('');
    setStatus(defaultStatus);
    pushParams({ q: '', status: defaultStatus });
  }

  function toggleStatus(value: TStatus) {
    setStatus((prev) => {
      const exists = prev.includes(value);
      const next = exists ? prev.filter((s) => s !== value) : [...prev, value];

      // If user unchecks everything -> fall back to default
      const normalized = next.length ? next : defaultStatus;
      pushParams({ q, status: normalized });
      return normalized;
    });
  }

  function setAllStatuses() {
    const allStatuses = [...all] as TStatus[];
    setStatus(allStatuses);
    pushParams({ q, status: allStatuses });
  }

  return {
    q,
    setQ,
    status,
    statusLabel,
    onSubmit,
    onClear,
    toggleStatus,
    setAllStatuses,
  };
}
