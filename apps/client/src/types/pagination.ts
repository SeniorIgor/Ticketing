export type PageInfo = {
  hasNextPage: boolean;
  nextCursor?: string;
};

export type Paginated<T> = {
  items: T[];
  pageInfo: PageInfo;
};
