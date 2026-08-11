import { CommandBus } from '../../../../shared/useCase/bus/bus';
import { getStripeCurrency } from '../../../../config/env.config';
import {
  CreatePaymentCommand,
  type CreatePaymentResult,
} from '../../../payment/contracts';
import type { CartCheckoutReservationCreatedEvent } from '../../domain/events/cart-checkout-reservation-created.event';
import { CartCheckoutCompletedEvent } from '../../domain/events/cart-checkout-completed.event';
import { EventBus } from '../../../../shared/domain/event.bus';

export class CartCheckoutPaymentListener {
  async listen(): Promise<void> {
    EventBus.getInstance().subscribe(
      'cart.checkout.reservation.created',
      async (event: CartCheckoutReservationCreatedEvent) => {
        const result = await CommandBus.execute<CreatePaymentResult>(
          new CreatePaymentCommand(
            event.amountInCents,
            getStripeCurrency(),
            'stripe',
            event.authId,
            'reservation',
            event.reservationId,
            event.cartId,
            event.pricingBreakdown,
          ),
        );

        await EventBus.getInstance().publish(
          new CartCheckoutCompletedEvent(
            event.correlationId,
            result.paymentId,
            result.clientSecret!,
            result.amount,
            result.currency,
            result.publishableKey,
            event.holdUntil,
          ),
        );
      },
    );
  }
}
