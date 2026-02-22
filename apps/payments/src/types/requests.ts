export type CreatePaymentReqBody = {
  orderId: string;
  token: string; // stripe token OR payment method id
};
