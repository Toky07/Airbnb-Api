export type InvoiceLineItem = {
  label: string;
  subtitle?: string;
  quantity: number;
  unitPriceCents: number;
  totalPriceCents: number;
  columns?: {
    dates?: string;
    guests?: number;
    nights?: number;
  };
};

export type InvoiceRecipient = {
  name: string;
  email: string;
  phone?: string;
};

export type InvoiceReference = {
  label: string;
  value: string;
};

export type InvoiceData = {
  invoiceNumber: string;
  paidAt: Date;
  currency: string;
  totalCents: number;
  recipient: InvoiceRecipient;
  references: InvoiceReference[];
  items: InvoiceLineItem[];
};
