import { DomainEvent } from '@src/shared/domain/domain.event';
import { PAYMENT_TYPE } from '@src/modules/payment/domain/types/payment.type';

export class PaymentCreatedEvent implements DomainEvent {
  eventName = 'payment.created';
  occurredOn = new Date();

  constructor(
    public readonly paymentId: number,
    public readonly propertyType: (typeof PAYMENT_TYPE)[keyof typeof PAYMENT_TYPE],
    public readonly propertyId: number,
  ) {}
}
