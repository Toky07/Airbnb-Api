export class InvoiceOutput {
  constructor(
    public readonly id: number,
    public readonly invoiceNumber: string,
    public readonly paymentType: string,
    public readonly paymentId: number,
    public readonly createdAt: Date,
  ) {}

  static fromDomain(invoice: {
    id?: number;
    invoiceNumber: string;
    paymentType: string;
    paymentId: number;
    createdAt?: Date;
  }): InvoiceOutput {
    return new InvoiceOutput(
      invoice.id!,
      invoice.invoiceNumber,
      invoice.paymentType,
      invoice.paymentId,
      invoice.createdAt ?? new Date(),
    );
  }
}
