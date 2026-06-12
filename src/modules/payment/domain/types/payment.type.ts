export type PaymentType = 'reservation' | 'order';

export const PAYMENT_TYPE = {
  RESERVATION: 'reservation',
  ORDER: 'order',
} as const;

export type PaymentTypeEnum = (typeof PAYMENT_TYPE)[keyof typeof PAYMENT_TYPE];
