import type { CartCheckoutRequestedEvent } from '../../../cart/domain/events/cart-checkout-requested.event';
import { CartCheckoutReservationCreatedEvent } from '../../../cart/domain/events/cart-checkout-reservation-created.event';
import { EventBus } from '../../../../shared/domain/event.bus';
import { CommandBus } from '../../../../shared/useCase/bus/bus';
import { CreateReservationCommand } from '../useCase/commands/CreateReservationCommand';
import type { ReservationOutput } from '../dto/reservation.output';

export class CartCheckoutListener {
  async listen(): Promise<void> {
    EventBus.getInstance().subscribe(
      'cart.checkout.requested',
      async (event: CartCheckoutRequestedEvent) => {
        const reservation = await CommandBus.execute<ReservationOutput>(
          new CreateReservationCommand(
            event.authId,
            event.items.map((item) => ({
              roomId: item.roomId,
              startDate: item.startDate,
              endDate: item.endDate,
              guestCount: item.guestCount,
            })),
          ),
        );

        if (!reservation.id) {
          throw new Error('Reservation not created');
        }

        const holdUntil =
          reservation.holdUntil instanceof Date
            ? reservation.holdUntil.toISOString()
            : reservation.holdUntil
              ? String(reservation.holdUntil)
              : null;

        await EventBus.getInstance().publish(
          new CartCheckoutReservationCreatedEvent(
            event.correlationId,
            event.authId,
            event.cartId,
            reservation.id,
            event.amountInCents,
            holdUntil,
          ),
        );
      },
    );
  }
}
