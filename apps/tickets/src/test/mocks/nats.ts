export const publishEventMock = jest.fn().mockResolvedValue(undefined);

jest.mock('@org/nats', () => {
  const actual = jest.requireActual('@org/nats');

  return {
    ...actual,
    publishEvent: publishEventMock,
  };
});
