export const PaymentSubjects = {
  PaymentCreated: 'payments.created',
} as const;

export type PaymentSubject = (typeof PaymentSubjects)[keyof typeof PaymentSubjects];
