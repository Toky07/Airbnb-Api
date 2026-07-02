import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { EventBus } from '../../../../../shared/domain/event.bus';
import { CartCheckoutCompletedEvent } from '../../../domain/events/cart-checkout-completed.event';
import { CheckoutCartCommandHandler } from './CheckoutCartCommandHandler';
import { CheckoutCartCommand } from '../commands/CheckoutCartCommand';
import { createSampleCart } from '../../cart-test.helpers';

describe('CheckoutCartCommandHandler', () => {
  const resolveCartService = { resolve: vi.fn() };
  const buildCartItemService = { buildCheckoutItems: vi.fn() };
  let handler: CheckoutCartCommandHandler;

  beforeEach(() => {
    vi.clearAllMocks();
    EventBus.getInstance()['handlers'] = new Map();
    resolveCartService.resolve.mockResolvedValue(createSampleCart());
    buildCartItemService.buildCheckoutItems.mockReturnValue([
      {
        itemType: 'reservation',
        roomId: 10,
        startDate: '2026-07-01',
        endDate: '2026-07-04',
        guestCount: 2,
      },
    ]);
    handler = new CheckoutCartCommandHandler(
      resolveCartService as never,
      buildCartItemService as never,
    );
  });

  it('publie cart.checkout.requested et retourne le paiement', async () => {
    EventBus.getInstance().subscribe(
      'cart.checkout.requested',
      async (event) => {
        await EventBus.getInstance().publish(
          new CartCheckoutCompletedEvent(
            event.correlationId,
            99,
            'secret_test',
            36000,
            'eur',
            'pk_test',
          ),
        );
      },
    );

    const result = await handler.execute(
      new CheckoutCartCommand(10, { authId: 10 }),
    );

    expect(result.paymentId).toBe(99);
    expect(result.clientSecret).toBe('secret_test');
  });

  it('refuse un panier vide', async () => {
    resolveCartService.resolve.mockResolvedValue(createSampleCart({ items: [] }));

    await expect(
      handler.execute(new CheckoutCartCommand(10, { authId: 10 })),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
