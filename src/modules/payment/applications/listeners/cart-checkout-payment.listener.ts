import type { CreateCartPaymentIntentUseCase } from '../useCase/create-cart-payment-intent.usecase';
import type { CartCheckoutReservationCreatedEvent } from '../../../cart/domain/events/cart-checkout-reservation-created.event';
import { CartCheckoutCompletedEvent } from '../../../cart/domain/events/cart-checkout-completed.event';
import { PAYMENT_TYPE } from '../../domain/types/payment.type';
import { EventBus } from '../../../../shared/domain/event.bus';

export class CartCheckoutPaymentListener {
  constructor(
    private readonly createCartPaymentIntentUseCase: CreateCartPaymentIntentUseCase,
  ) {}

  async listen(): Promise<void> {
    EventBus.getInstance().subscribe(
      'cart.checkout.reservation.created',
      async (event: CartCheckoutReservationCreatedEvent) => {
        const payment = await this.createCartPaymentIntentUseCase.execute({
          authId: event.authId,
          cartId: event.cartId,
          amountInCents: event.amountInCents,
          propertyType: PAYMENT_TYPE.RESERVATION,
          propertyId: event.reservationId,
        });

        await EventBus.getInstance().publish(
          new CartCheckoutCompletedEvent(
            event.correlationId,
            payment.paymentId,
            payment.clientSecret,
            payment.amount,
            payment.currency,
            payment.publishableKey,
          ),
        );
      },
    );
  }
}
