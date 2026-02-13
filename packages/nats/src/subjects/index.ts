import { ExpirationSubjects } from './expiration';
import { OrderSubjects } from './orders';
import { PaymentSubjects } from './payments';
import { TicketSubjects } from './tickets';

export const Subjects = {
  ...TicketSubjects,
  ...OrderSubjects,
  ...ExpirationSubjects,
  ...PaymentSubjects,
} as const;

export type Subject = (typeof Subjects)[keyof typeof Subjects];
