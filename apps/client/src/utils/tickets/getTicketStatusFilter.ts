import { type TicketStatus, TicketStatusValues } from '@/services/tickets';

type SearchParamsLike = Record<string, string | string[] | undefined>;

export function getTicketStatusFilter(sp?: SearchParamsLike): TicketStatus[] | undefined {
  const raw = sp?.status;
  const arr = Array.isArray(raw) ? raw : raw ? [raw] : [];

  const normalized = arr
    .map((x) => x.trim())
    .filter(Boolean)
    .filter((x): x is TicketStatus => (TicketStatusValues as readonly string[]).includes(x));

  return normalized.length ? normalized : undefined;
}
