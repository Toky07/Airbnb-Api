import type { Invoice } from '../entities/invoice.entity';
import type { InvoicePaymentType } from '../constants/invoice-payment-type.constant';

export const INVOICE_REPOSITORY = 'INVOICE_REPOSITORY';

export interface IInvoiceRepository {
  create(invoice: Invoice): Promise<Invoice>;
  findByPayment(
    paymentType: InvoicePaymentType,
    paymentId: number,
  ): Promise<Invoice | null>;
}
