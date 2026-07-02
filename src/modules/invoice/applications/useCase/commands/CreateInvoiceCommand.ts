import type { InvoiceData } from '../../../domain/types/invoice-data.type';
import type { InvoicePaymentType } from '../../../domain/constants/invoice-payment-type.constant';

export class CreateInvoiceCommand {
  constructor(
    public readonly userId: number,
    public readonly paymentType: InvoicePaymentType,
    public readonly paymentId: number,
    public readonly data: InvoiceData,
  ) {}
}
