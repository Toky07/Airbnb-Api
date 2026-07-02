import { CommandBus } from '../../../../shared/useCase/bus/bus';
import { VerifyPaymentCommand } from '../../../payment/applications/useCase/commands/VerifyPaymentCommand';
import type { VerifyPaymentResult } from '../../../payment/applications/useCase/handlers/VerifyPaymentCommandHandler';
import type { CartCheckoutCompleteRequestedEvent } from '../../domain/events/cart-checkout-complete-requested.event';
import { CartCheckoutCompleteVerifiedEvent } from '../../domain/events/cart-checkout-complete-verified.event';
import { EventBus } from '../../../../shared/domain/event.bus';

export class CartCheckoutCompleteListener {
  async listen(): Promise<void> {
    EventBus.getInstance().subscribe(
      'cart.checkout.complete.requested',
      async (event: CartCheckoutCompleteRequestedEvent) => {
        const result = await CommandBus.execute<VerifyPaymentResult>(
          new VerifyPaymentCommand(event.paymentId),
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
