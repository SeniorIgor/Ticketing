import { ExpirationSubjects } from './expiration';
import { OrderSubjects } from './orders';
import { TicketSubjects } from './tickets';

export const Subjects = {
  ...TicketSubjects,
  ...OrderSubjects,
  ...ExpirationSubjects,
} as const;

export type Subject = (typeof Subjects)[keyof typeof Subjects];
