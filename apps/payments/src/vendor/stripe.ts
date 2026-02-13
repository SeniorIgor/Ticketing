export const stripe = {
  async charge(_params: {
    token: string;
    amount: number;
    currency: string;
    idempotencyKey: string;
  }): Promise<{ id: string }> {
    // real impl later; in tests you'll mock this module
    console.error('Payment not implemented');
    return Promise.resolve({ id: '123' });
  },
};
