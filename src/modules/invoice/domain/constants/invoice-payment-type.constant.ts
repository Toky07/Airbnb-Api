export const INVOICE_PAYMENT_TYPE = {
  RESERVATION: 'reservation',
} as const;

export type InvoicePaymentType =
  (typeof INVOICE_PAYMENT_TYPE)[keyof typeof INVOICE_PAYMENT_TYPE];
