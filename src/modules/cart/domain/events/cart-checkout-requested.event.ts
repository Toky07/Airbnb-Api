import { DomainEvent } from '../../../../shared/domain/domain.event';

export type CartCheckoutItemPayload = {
  itemType: string;
  roomId: number;
  startDate: string;
  endDate: string;
  guestCount: number;
};

export class CartCheckoutRequestedEvent implements DomainEvent {
  eventName = 'cart.checkout.requested';
  occurredOn = new Date();

  constructor(
    public readonly correlationId: string,
    public readonly authId: number,
    public readonly cartId: number,
    public readonly amountInCents: number,
    public readonly items: CartCheckoutItemPayload[],
  ) {}
}
