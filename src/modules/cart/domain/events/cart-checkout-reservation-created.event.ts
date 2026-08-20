import { DomainEvent } from '@src/shared/domain/domain.event';
import type { PricingBreakdown } from '@src/shared/pricing/pricing-breakdown.types';

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
    public readonly stripeAccountId: string | null = null,
    public readonly hostUserId: number | null = null,
  ) {}
}
