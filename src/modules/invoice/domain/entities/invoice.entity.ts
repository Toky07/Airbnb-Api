import type { InvoicePaymentType } from '../constants/invoice-payment-type.constant';

export class Invoice {
  constructor(
    public readonly userId: number,
    public readonly paymentType: InvoicePaymentType,
    public readonly paymentId: number,
    public readonly path: string,
    public readonly invoiceNumber: string,
    public readonly id?: number,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
