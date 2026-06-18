import type { VerifyCartCheckoutPaymentService } from '../services/verify-cart-checkout-payment.service';
import type { CartCheckoutCompleteRequestedEvent } from '../../../cart/domain/events/cart-checkout-complete-requested.event';
import { CartCheckoutCompleteVerifiedEvent } from '../../../cart/domain/events/cart-checkout-complete-verified.event';
import { EventBus } from '../../../../shared/domain/event.bus';

export class CartCheckoutCompleteListener {
  constructor(
    private readonly verifyCartCheckoutPayment: VerifyCartCheckoutPaymentService,
  ) {}

  async listen(): Promise<void> {
    EventBus.getInstance().subscribe(
      'cart.checkout.complete.requested',
      async (event: CartCheckoutCompleteRequestedEvent) => {
        const result = await this.verifyCartCheckoutPayment.execute(event);

        await EventBus.getInstance().publish(
          new CartCheckoutCompleteVerifiedEvent(
            event.correlationId,
            event.paymentId,
            result.cartId,
          ),
        );
      },
    );
  }
}
