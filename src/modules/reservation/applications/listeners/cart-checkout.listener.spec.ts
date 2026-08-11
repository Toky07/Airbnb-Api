import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EventBus } from '@src/shared/domain/event.bus';
import {
  CartCheckoutRequestedEvent,
  CartCheckoutReservationCreatedEvent,
} from '@src/modules/cart/contracts';
import { CartCheckoutListener } from './cart-checkout.listener';
import { commandBusExecuteMock } from '@src/test/command-bus.mock';
import { samplePricingBreakdown } from '@src/modules/cart/applications/useCase/handlers/checkout-test.helpers';

describe('CartCheckoutListener', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    EventBus.getInstance()['handlers'] = new Map();
    commandBusExecuteMock.mockResolvedValue({ id: 12 });
  });

  it('crée une réservation puis publie cart.checkout.reservation.created', async () => {
    const published: CartCheckoutReservationCreatedEvent[] = [];
    EventBus.getInstance().subscribe(
      'cart.checkout.reservation.created',
      async (event: CartCheckoutReservationCreatedEvent) => {
        published.push(event);
      },
    );

    const listener = new CartCheckoutListener();
    await listener.listen();

    await EventBus.getInstance().publish(
      new CartCheckoutRequestedEvent(
        'corr-1',
        10,
        5,
        39600,
        [
          {
            itemType: 'reservation',
            roomId: 10,
            startDate: '2026-07-01',
            endDate: '2026-07-04',
            guestCount: 2,
          },
        ],
        samplePricingBreakdown,
      ),
    );

    expect(commandBusExecuteMock).toHaveBeenCalled();
    expect(published[0]?.reservationId).toBe(12);
  });
});
