export const INVOICE_EVENTS = {
  GENERATE_REQUESTED: 'invoice.generate.requested',
  CREATED: 'invoice.created',
} as const;

export type InvoiceEventName =
  (typeof INVOICE_EVENTS)[keyof typeof INVOICE_EVENTS];
