export type RedisConfig = {
  host: string;
  port: number;
  password?: string;
  db?: number;

  /**
   * BullMQ best practice: for blocking operations, set null so ioredis doesn't retry mid-block.
   */
  maxRetriesPerRequest?: null;

  enableReadyCheck?: boolean;
};
