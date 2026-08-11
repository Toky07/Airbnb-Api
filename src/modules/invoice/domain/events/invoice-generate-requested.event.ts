import { DomainEvent } from '@src/shared/domain/domain.event';
import type { InvoiceData } from '@src/modules/invoice/domain/types/invoice-data.type';
import type { InvoicePaymentType } from '@src/modules/invoice/domain/constants/invoice-payment-type.constant';

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
