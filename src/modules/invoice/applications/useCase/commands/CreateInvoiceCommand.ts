import type { InvoiceData } from '@src/modules/invoice/domain/types/invoice-data.type';
import type { InvoicePaymentType } from '@src/modules/invoice/domain/constants/invoice-payment-type.constant';

export class CreateInvoiceCommand {
  constructor(
    public readonly userId: number,
    public readonly paymentType: InvoicePaymentType,
    public readonly paymentId: number,
    public readonly data: InvoiceData,
  ) {}
}
