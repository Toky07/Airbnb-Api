import { DomainEvent } from '@src/shared/domain/domain.event';

export class CartCheckoutCompleteVerifiedEvent implements DomainEvent {
  eventName = 'cart.checkout.complete.verified';
  occurredOn = new Date();

  constructor(
    public readonly correlationId: string,
    public readonly paymentId: number,
    public readonly cartId: number,
  ) {}
}
