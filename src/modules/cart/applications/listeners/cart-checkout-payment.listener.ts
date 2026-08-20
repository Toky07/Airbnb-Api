import { CommandBus } from '@src/shared/useCase/bus/bus';
import { getStripeCurrency } from '@src/config/env.config';
import { computeApplicationFeeAmount } from '@src/shared/pricing/compute-application-fee.service';
import {
  CreatePaymentCommand,
  type CreatePaymentResult,
} from '@src/modules/payment/contracts';
import type { CartCheckoutReservationCreatedEvent } from '@src/modules/cart/domain/events/cart-checkout-reservation-created.event';
import { CartCheckoutCompletedEvent } from '@src/modules/cart/domain/events/cart-checkout-completed.event';
import { EventBus } from '@src/shared/domain/event.bus';

export class CartCheckoutPaymentListener {
  async listen(): Promise<void> {
    EventBus.getInstance().subscribe(
      'cart.checkout.reservation.created',
      async (event: CartCheckoutReservationCreatedEvent) => {
        if (!event.stripeAccountId || event.hostUserId == null) {
          throw new Error('Compte Stripe Connect hôte manquant.');
        }

        const applicationFeeAmount = event.pricingBreakdown
          ? computeApplicationFeeAmount(event.pricingBreakdown)
              .applicationFeeAmount
          : 0;

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
            event.stripeAccountId,
            applicationFeeAmount,
            event.hostUserId,
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
