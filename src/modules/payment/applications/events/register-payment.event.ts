import { Injectable, OnModuleInit } from '@nestjs/common';
import { CreateCartPaymentIntentUseCase } from '../useCase/create-cart-payment-intent.usecase';
import { VerifyCartCheckoutPaymentService } from '../services/verify-cart-checkout-payment.service';
import { CartCheckoutPaymentListener } from '../listeners/cart-checkout-payment.listener';
import { CartCheckoutCompleteListener } from '../listeners/cart-checkout-complete.listener';

@Injectable()
export class PaymentEvent implements OnModuleInit {
  constructor(
    private readonly createCartPaymentIntentUseCase: CreateCartPaymentIntentUseCase,
    private readonly verifyCartCheckoutPayment: VerifyCartCheckoutPaymentService,
  ) {}

  async onModuleInit(): Promise<void> {
    const cartCheckoutPaymentListener = new CartCheckoutPaymentListener(
      this.createCartPaymentIntentUseCase,
    );
    const cartCheckoutCompleteListener = new CartCheckoutCompleteListener(
      this.verifyCartCheckoutPayment,
    );

    await cartCheckoutPaymentListener.listen();
    await cartCheckoutCompleteListener.listen();
  }
}
