import { Injectable, OnModuleInit } from '@nestjs/common';
import { CartCheckoutPaymentListener } from '@src/modules/cart/applications/listeners/cart-checkout-payment.listener';
import { CartCheckoutCompleteListener } from '@src/modules/cart/applications/listeners/cart-checkout-complete.listener';

@Injectable()
export class CartPaymentEvent implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    const paymentListener = new CartCheckoutPaymentListener();
    const completeListener = new CartCheckoutCompleteListener();

    await paymentListener.listen();
    await completeListener.listen();
  }
}
