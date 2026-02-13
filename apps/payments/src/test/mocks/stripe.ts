export const stripeChargeMock = jest.fn();

jest.mock('../../vendor/stripe', () => ({
  stripe: {
    charge: (...args: unknown[]) => stripeChargeMock(...args),
  },
}));
