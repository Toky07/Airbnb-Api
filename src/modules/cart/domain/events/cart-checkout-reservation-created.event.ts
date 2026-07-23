import { DomainEvent } from '../../../../shared/domain/domain.event';
import type { PricingBreakdown } from '../../../../shared/pricing/pricing-breakdown.types';

export class CartCheckoutReservationCreatedEvent implements DomainEvent {
  eventName = 'cart.checkout.reservation.created';
  occurredOn = new Date();

  constructor(
    public readonly correlationId: string,
    public readonly authId: number,
    public readonly cartId: number,
    public readonly reservationId: number,
    public readonly amountInCents: number,
    public readonly holdUntil: string | null = null,
    public readonly pricingBreakdown: PricingBreakdown | null = null,
  ) {}
}
