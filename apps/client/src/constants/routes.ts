export const ROUTES = {
  home: '/',
  signIn: '/signin',
  signUp: '/signup',

  tickets: {
    root: '/tickets',
    new: '/tickets/new',
    details: (id: string) => `/tickets/${id}`,
    mine: '/tickets/mine',
  },

  orders: {
    root: '/orders',
    details: (id: string) => `/orders/${id}`,
  },

  payments: {
    root: '/payments',
    new: (orderId: string) => `/payments/new?orderId=${encodeURIComponent(orderId)}`,
    details: (paymentId: string) => `/payments/${paymentId}`,
    success: (orderId: string) => `/payments/success?orderId=${encodeURIComponent(orderId)}`,
  },
} as const;
