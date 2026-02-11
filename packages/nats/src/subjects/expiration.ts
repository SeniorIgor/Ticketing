export const ExpirationSubjects = {
  OrderExpired: 'expiration.order-expired',
} as const;

export type ExpirationSubject = (typeof ExpirationSubjects)[keyof typeof ExpirationSubjects];
