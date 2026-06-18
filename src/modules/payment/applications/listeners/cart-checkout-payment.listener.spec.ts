import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EventBus } from '../../../../shared/domain/event.bus';
import { CartCheckoutReservationCreatedEvent } from '../../../cart/domain/events/cart-checkout-reservation-created.event';
import { CartCheckoutCompletedEvent } from '../../../cart/domain/events/cart-checkout-completed.event';
import { CartCheckoutPaymentListener } from './cart-checkout-payment.listener';

describe('CartCheckoutPaymentListener', () => {
  const createCartPaymentIntentUseCase = {
    execute: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    EventBus.getInstance()['handlers'] = new Map();
    createCartPaymentIntentUseCase.execute.mockResolvedValue({
      paymentId: 77,
      clientSecret: 'secret',
      amount: 36000,
      currency: 'eur',
      publishableKey: 'pk_test',
    });
  });

  it('crée le paiement puis publie cart.checkout.completed', async () => {
    const published: CartCheckoutCompletedEvent[] = [];
    EventBus.getInstance().subscribe(
      'cart.checkout.completed',
      async (event: CartCheckoutCompletedEvent) => {
        published.push(event);
      },
    );

    const listener = new CartCheckoutPaymentListener(
      createCartPaymentIntentUseCase as never,
    );
    await listener.listen();

    await EventBus.getInstance().publish(
      new CartCheckoutReservationCreatedEvent('corr-1', 10, 5, 12, 36000),
    );

    expect(createCartPaymentIntentUseCase.execute).toHaveBeenCalled();
    expect(published[0]?.paymentId).toBe(77);
  });
});
