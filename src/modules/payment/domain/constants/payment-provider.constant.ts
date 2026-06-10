export const PAYMENT_PROVIDER = {
  STRIPE: 'stripe',
} as const;

export type PaymentProvider =
  (typeof PAYMENT_PROVIDER)[keyof typeof PAYMENT_PROVIDER];
