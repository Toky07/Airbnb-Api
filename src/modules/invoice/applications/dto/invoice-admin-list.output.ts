import type { InvoiceListRecord } from '@src/modules/invoice/domain/types/invoice-list-record.type';

export class InvoiceAdminListOutput {
  constructor(
    public readonly id: number,
    public readonly invoiceNumber: string,
    public readonly paymentType: string,
    public readonly paymentId: number,
    public readonly userId: number,
    public readonly customerName: string,
    public readonly customerEmail: string,
    public readonly createdAt: Date,
  ) {}

  static fromRecord(record: InvoiceListRecord): InvoiceAdminListOutput {
    return new InvoiceAdminListOutput(
      record.id,
      record.invoiceNumber,
      record.paymentType,
      record.paymentId,
      record.userId,
      record.customerName,
      record.customerEmail,
      record.createdAt,
    );
  }
}
