import type { CursorPage, HasId } from './types';

export function withPagination<T extends HasId>(itemsPlusOne: T[], limit: number): CursorPage<T> {
  const hasNextPage = itemsPlusOne.length > limit;
  const items = hasNextPage ? itemsPlusOne.slice(0, limit) : itemsPlusOne;

  const nextCursor = hasNextPage ? items[items.length - 1]?.id : undefined;

  return {
    items,
    pageInfo: { hasNextPage, nextCursor },
  };
}
