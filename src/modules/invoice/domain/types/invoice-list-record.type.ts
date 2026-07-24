export type InvoiceListRecord = {
  id: number;
  invoiceNumber: string;
  paymentType: string;
  paymentId: number;
  userId: number;
  customerName: string;
  customerEmail: string;
  createdAt: Date;
};
