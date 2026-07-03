import { DomainEvent } from '../../../../shared/domain/domain.event';
import { PAYMENT_TYPE } from '../types/payment.type';

export class PaymentCreatedEvent implements DomainEvent {
  eventName = 'payment.created';
  occurredOn = new Date();

  constructor(
    public readonly paymentId: number,
    public readonly propertyType: (typeof PAYMENT_TYPE)[keyof typeof PAYMENT_TYPE],
    public readonly propertyId: number,
  ) {}
}
