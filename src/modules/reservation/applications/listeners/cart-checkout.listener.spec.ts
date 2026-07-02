import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EventBus } from '../../../../shared/domain/event.bus';
import { CartCheckoutRequestedEvent } from '../../../cart/domain/events/cart-checkout-requested.event';
import { CartCheckoutReservationCreatedEvent } from '../../../cart/domain/events/cart-checkout-reservation-created.event';
import { CartCheckoutListener } from './cart-checkout.listener';

const mockExecute = vi.fn();

vi.mock('../../../../shared/useCase/bus/bus', () => ({
  CommandBus: { execute: (...args: unknown[]) => mockExecute(...args) },
}));

describe('CartCheckoutListener', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    EventBus.getInstance()['handlers'] = new Map();
    mockExecute.mockResolvedValue({ id: 12 });
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
      new CartCheckoutRequestedEvent('corr-1', 10, 5, 36000, [
        {
          itemType: 'reservation',
          roomId: 10,
          startDate: '2026-07-01',
          endDate: '2026-07-04',
          guestCount: 2,
        },
      ]),
    );

    expect(mockExecute).toHaveBeenCalled();
    expect(published[0]?.reservationId).toBe(12);
  });
});
