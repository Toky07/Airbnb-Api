/**
 * Surface publique du module invoice.
 * Les autres modules doivent importer uniquement depuis ce barrel
 * (sauf ORM TypeORM et InvoiceModule Nest).
 */
export {
  buildInvoiceNumber,
  formatInvoiceAmount,
  formatInvoiceDate,
} from '@src/modules/invoice/applications/utils/format-invoice.util';
export { InvoiceCreatedEvent } from '@src/modules/invoice/domain/events/invoice-created.event';
export { InvoiceGenerateRequestedEvent } from '@src/modules/invoice/domain/events/invoice-generate-requested.event';
export {
  INVOICE_PAYMENT_TYPE,
  type InvoicePaymentType,
} from '@src/modules/invoice/domain/constants/invoice-payment-type.constant';
export {
  getInvoiceBrand,
  getInvoiceIssuer,
  type InvoiceBrandConfig,
  type InvoiceIssuerConfig,
} from '@src/modules/invoice/domain/constants/invoice-source.constant';
export type {
  InvoiceData,
  InvoiceLineItem,
  InvoiceRecipient,
  InvoiceReference,
  InvoiceTotals,
  InvoiceIssuer,
} from '@src/modules/invoice/domain/types/invoice-data.type';
export {
  INVOICE_REPOSITORY,
  type IInvoiceRepository,
} from '@src/modules/invoice/domain/repositories/invoice.repository';
export { InvoiceNumberService } from '@src/modules/invoice/applications/services/invoice-number.service';
