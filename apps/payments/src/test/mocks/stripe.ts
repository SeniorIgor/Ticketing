import type { ChargeParams, ChargeResult } from '../../vendor/stripe';

jest.mock('../../vendor/stripe', () => ({
  createCharge: jest.fn(),
}));

type CreateChargeFn = (params: ChargeParams) => Promise<ChargeResult>;

export const stripeChargeMock = jest.requireMock('../../vendor/stripe')
  .createCharge as jest.MockedFunction<CreateChargeFn>;
