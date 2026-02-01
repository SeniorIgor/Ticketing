export const TicketSubjects = {
  TicketCreated: 'tickets.created',
  TicketUpdated: 'tickets.updated',
} as const;

export type TicketSubject = (typeof TicketSubjects)[keyof typeof TicketSubjects];
