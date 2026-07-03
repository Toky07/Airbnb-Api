import { DomainEvent } from '../../../../shared/domain/domain.event';
import { Payment } from '../entities/payment.entity';

export class PaymentConfirmedEvent implements DomainEvent {
  eventName = 'payment.confirmed';
  occurredOn = new Date();

  constructor(public readonly payment: Payment) {}
}
