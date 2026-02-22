export function makeCreatePaymentReq(attrs?: Partial<{ orderId: string; token: string }>) {
  return {
    orderId: attrs?.orderId ?? 'missing-order-id',
    token: attrs?.token ?? 'tok_visa',
  };
}
