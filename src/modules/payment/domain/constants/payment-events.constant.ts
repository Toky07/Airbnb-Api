export const PAYMENT_EVENTS = {
  CREATED: 'payment.created',
  CONFIRMED: 'payment.confirmed',
} as const;

export type PaymentEventName =
  (typeof PAYMENT_EVENTS)[keyof typeof PAYMENT_EVENTS];
