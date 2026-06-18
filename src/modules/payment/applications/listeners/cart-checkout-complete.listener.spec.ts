import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EventBus } from '../../../../shared/domain/event.bus';
import { CartCheckoutCompleteRequestedEvent } from '../../../cart/domain/events/cart-checkout-complete-requested.event';
import { CartCheckoutCompleteVerifiedEvent } from '../../../cart/domain/events/cart-checkout-complete-verified.event';
import { CartCheckoutCompleteListener } from './cart-checkout-complete.listener';

describe('CartCheckoutCompleteListener', () => {
  const verifyCartCheckoutPayment = {
    execute: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    EventBus.getInstance()['handlers'] = new Map();
    verifyCartCheckoutPayment.execute.mockResolvedValue({ cartId: 5 });
  });

  it('vérifie le paiement puis publie cart.checkout.complete.verified', async () => {
    const published: CartCheckoutCompleteVerifiedEvent[] = [];
    EventBus.getInstance().subscribe(
      'cart.checkout.complete.verified',
      async (event: CartCheckoutCompleteVerifiedEvent) => {
        published.push(event);
      },
    );

    const listener = new CartCheckoutCompleteListener(
      verifyCartCheckoutPayment as never,
    );
    await listener.listen();

    await EventBus.getInstance().publish(
      new CartCheckoutCompleteRequestedEvent('corr-2', 10, 99),
    );

    expect(verifyCartCheckoutPayment.execute).toHaveBeenCalled();
    expect(published[0]?.cartId).toBe(5);
  });
});
