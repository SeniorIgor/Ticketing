import { TicketSubjects } from './tickets';

export const Subjects = {
  ...TicketSubjects,
} as const;

export type Subject = (typeof Subjects)[keyof typeof Subjects];
