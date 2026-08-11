import { DomainEvent } from '@src/shared/domain/domain.event';
import { Payment } from '@src/modules/payment/domain/entities/payment.entity';

export class PaymentConfirmedEvent implements DomainEvent {
  eventName = 'payment.confirmed';
  occurredOn = new Date();

  constructor(public readonly payment: Payment) {}
}
