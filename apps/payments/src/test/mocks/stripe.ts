export const stripeCreatePaymentIntentMock = jest.fn();
export const stripeGetPaymentIntentMock = jest.fn();

jest.mock('../../vendor/stripe', () => {
  return {
    createPaymentIntent: (...args: unknown[]) => stripeCreatePaymentIntentMock(...args),
    getPaymentIntent: (...args: unknown[]) => stripeGetPaymentIntentMock(...args),
  };
});
