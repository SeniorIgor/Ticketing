export const PaymentSubjects = {
  PaymentCreated: 'payment.created',
} as const;

export type PaymentSubject = (typeof PaymentSubjects)[keyof typeof PaymentSubjects];
