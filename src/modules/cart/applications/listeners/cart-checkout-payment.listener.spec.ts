import { beforeEach, describe, expect, it } from 'vitest';
import { EventBus } from '@src/shared/domain/event.bus';
import { CartCheckoutReservationCreatedEvent } from '@src/modules/cart/domain/events/cart-checkout-reservation-created.event';
import { CartCheckoutCompletedEvent } from '@src/modules/cart/domain/events/cart-checkout-completed.event';
import { CreatePaymentCommand } from '@src/modules/payment/contracts';
import { commandBusExecuteMock } from '@src/test/command-bus.mock';
import { samplePricingBreakdown } from '@src/modules/cart/applications/useCase/handlers/checkout-test.helpers';
import { CartCheckoutPaymentListener } from './cart-checkout-payment.listener';

describe('CartCheckoutPaymentListener', () => {
  beforeEach(() => {
    EventBus.getInstance()['handlers'] = new Map();
    commandBusExecuteMock.mockResolvedValue({
      paymentId: 44,
      clientSecret: 'secret_connect',
      amount: 22000,
      currency: 'eur',
      publishableKey: 'pk_test',
    });
  });

  it('crée un PaymentIntent destination avec application_fee', async () => {
    const completed: CartCheckoutCompletedEvent[] = [];
    EventBus.getInstance().subscribe(
      'cart.checkout.completed',
      async (event: CartCheckoutCompletedEvent) => {
        completed.push(event);
      },
    );

    const listener = new CartCheckoutPaymentListener();
    await listener.listen();

    await EventBus.getInstance().publish(
      new CartCheckoutReservationCreatedEvent(
        'corr-1',
        10,
        5,
        12,
        22000,
        null,
        samplePricingBreakdown,
        'acct_test_host',
        7,
      ),
    );

    expect(commandBusExecuteMock).toHaveBeenCalledWith(
      expect.any(CreatePaymentCommand),
    );
    const command = commandBusExecuteMock.mock
      .calls[0][0] as CreatePaymentCommand;
    expect(command.transferDestination).toBe('acct_test_host');
    expect(command.hostUserId).toBe(7);
    expect(command.applicationFeeAmount).toBeGreaterThan(0);
    expect(completed[0]?.paymentId).toBe(44);
  });
});
