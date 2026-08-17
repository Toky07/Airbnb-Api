import { CommandBus } from '@src/shared/useCase/bus/bus';
import {
  VerifyPaymentCommand,
  type VerifyPaymentResult,
} from '@src/modules/payment/contracts';
import type { CartCheckoutCompleteRequestedEvent } from '@src/modules/cart/domain/events/cart-checkout-complete-requested.event';
import { CartCheckoutCompleteVerifiedEvent } from '@src/modules/cart/domain/events/cart-checkout-complete-verified.event';
import { EventBus } from '@src/shared/domain/event.bus';

export class CartCheckoutCompleteListener {
  async listen(): Promise<void> {
    EventBus.getInstance().subscribe(
      'cart.checkout.complete.requested',
      async (event: CartCheckoutCompleteRequestedEvent) => {
        const result = await CommandBus.execute<VerifyPaymentResult>(
          new VerifyPaymentCommand(event.paymentId, event.authId),
        );

        await EventBus.getInstance().publish(
          new CartCheckoutCompleteVerifiedEvent(
            event.correlationId,
            event.paymentId,
            result.cartId!,
          ),
        );
      },
    );
  }
}
