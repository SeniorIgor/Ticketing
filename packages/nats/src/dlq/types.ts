export type DeadLetterRecord = {
  originalSubject: string;
  stream: string;
  consumer: string;

  seq?: number;
  delivered?: number;

  error: string;
  raw?: string;

  headers?: Record<string, string>;
  at: string;
};
