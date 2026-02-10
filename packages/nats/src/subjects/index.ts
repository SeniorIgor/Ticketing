import { OrderSubjects } from './orders';
import { TicketSubjects } from './tickets';

export const Subjects = {
  ...TicketSubjects,
  ...OrderSubjects,
} as const;

export type Subject = (typeof Subjects)[keyof typeof Subjects];
