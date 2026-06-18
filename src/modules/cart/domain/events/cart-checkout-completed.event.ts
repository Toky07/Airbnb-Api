import { DomainEvent } from '../../../../shared/domain/domain.event';

export class CartCheckoutCompletedEvent implements DomainEvent {
  eventName = 'cart.checkout.completed';
  occurredOn = new Date();

  constructor(
    public readonly correlationId: string,
    public readonly paymentId: number,
    public readonly clientSecret: string,
    public readonly amountInCents: number,
    public readonly currency: string,
    public readonly publishableKey: string,
  ) {}
}
