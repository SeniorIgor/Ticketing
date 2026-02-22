export interface CursorPage<T> {
  items: T[];
  pageInfo: {
    hasNextPage: boolean;
    nextCursor?: string;
  };
}

export interface HasId {
  id: string;
}
