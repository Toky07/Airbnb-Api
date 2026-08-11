/**
 * Surface publique du module invoice.
 * Les autres modules doivent importer uniquement depuis ce barrel
 * (sauf ORM TypeORM et InvoiceModule Nest).
 */
export {
  buildInvoiceNumber,
  formatInvoiceAmount,
  formatInvoiceDate,
} from '../applications/utils/format-invoice.util';
export { InvoiceCreatedEvent } from '../domain/events/invoice-created.event';
export { InvoiceGenerateRequestedEvent } from '../domain/events/invoice-generate-requested.event';
export {
  INVOICE_PAYMENT_TYPE,
  type InvoicePaymentType,
} from '../domain/constants/invoice-payment-type.constant';
export {
  getInvoiceBrand,
  getInvoiceIssuer,
  type InvoiceBrandConfig,
  type InvoiceIssuerConfig,
} from '../domain/constants/invoice-source.constant';
export type {
  InvoiceData,
  InvoiceLineItem,
  InvoiceRecipient,
  InvoiceReference,
  InvoiceTotals,
  InvoiceIssuer,
} from '../domain/types/invoice-data.type';
export {
  INVOICE_REPOSITORY,
  type IInvoiceRepository,
} from '../domain/repositories/invoice.repository';
export { InvoiceNumberService } from '../applications/services/invoice-number.service';
