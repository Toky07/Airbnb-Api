import { DomainEvent } from '@src/shared/domain/domain.event';
import type { InvoicePaymentType } from '@src/modules/invoice/domain/constants/invoice-payment-type.constant';

export class InvoiceCreatedEvent implements DomainEvent {
  eventName = 'invoice.created';
  occurredOn = new Date();

  constructor(
    public readonly invoiceId: number,
    public readonly userId: number,
    public readonly paymentType: InvoicePaymentType,
    public readonly paymentId: number,
    public readonly path: string,
    public readonly invoiceNumber: string,
    public readonly fileName: string,
  ) {}
}
