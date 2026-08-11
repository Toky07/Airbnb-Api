import type { Invoice } from '@src/modules/invoice/domain/entities/invoice.entity';
import type { InvoicePaymentType } from '@src/modules/invoice/domain/constants/invoice-payment-type.constant';
import type { InvoiceListRecord } from '@src/modules/invoice/domain/types/invoice-list-record.type';
import type {
  PaginatedResult,
  PaginationParams,
} from '@src/shared/pagination/pagination.types';

export const INVOICE_REPOSITORY = 'INVOICE_REPOSITORY';

export interface IInvoiceRepository {
  create(invoice: Invoice): Promise<Invoice>;
  findByPayment(
    paymentType: InvoicePaymentType,
    paymentId: number,
  ): Promise<Invoice | null>;
  findById(id: number): Promise<Invoice | null>;
  findByUserId(userId: number): Promise<Invoice[]>;
  findPaginated(
    params: PaginationParams,
  ): Promise<PaginatedResult<InvoiceListRecord>>;
}
