import { DomainEvent } from '@src/shared/domain/domain.event';

export class CartCheckoutCompleteRequestedEvent implements DomainEvent {
  eventName = 'cart.checkout.complete.requested';
  occurredOn = new Date();

  constructor(
    public readonly correlationId: string,
    public readonly authId: number,
    public readonly paymentId: number,
  ) {}
}
