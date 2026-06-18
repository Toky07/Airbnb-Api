import type { CreateReservationUseCase } from '../useCase/create-reservation.usecase';
import type { CartCheckoutRequestedEvent } from '../../../cart/domain/events/cart-checkout-requested.event';
import { CartCheckoutReservationCreatedEvent } from '../../../cart/domain/events/cart-checkout-reservation-created.event';
import { EventBus } from '../../../../shared/domain/event.bus';

export class CartCheckoutListener {
  constructor(
    private readonly createReservationUseCase: CreateReservationUseCase,
  ) {}

  async listen(): Promise<void> {
    EventBus.getInstance().subscribe(
      'cart.checkout.requested',
      async (event: CartCheckoutRequestedEvent) => {
        const reservation = await this.createReservationUseCase.execute(
          event.authId,
          event.items.map((item) => ({
            roomId: item.roomId,
            startDate: item.startDate,
            endDate: item.endDate,
            guestCount: item.guestCount,
          })),
        );

        if (!reservation.id) {
          throw new Error('Reservation not created');
        }

        await EventBus.getInstance().publish(
          new CartCheckoutReservationCreatedEvent(
            event.correlationId,
            event.authId,
            event.cartId,
            reservation.id,
            event.amountInCents,
          ),
        );
      },
    );
  }
}
