import { DomainEvent } from '../../../../shared/domain/domain.event';
import type { InvoiceData } from '../types/invoice-data.type';
import type { InvoicePaymentType } from '../constants/invoice-payment-type.constant';

export class InvoiceGenerateRequestedEvent implements DomainEvent {
  eventName = 'invoice.generate.requested';
  occurredOn = new Date();

  constructor(
    public readonly userId: number,
    public readonly paymentType: InvoicePaymentType,
    public readonly paymentId: number,
    public readonly data: InvoiceData,
  ) {}
}
