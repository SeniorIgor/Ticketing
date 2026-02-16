export const PaymentProviders = {
  Stripe: 'stripe',
} as const;

export type PaymentProvider = (typeof PaymentProviders)[keyof typeof PaymentProviders];

export const PaymentProviderValues = Object.values(PaymentProviders) as readonly PaymentProvider[];
