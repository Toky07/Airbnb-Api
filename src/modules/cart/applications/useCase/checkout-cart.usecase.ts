import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { EventBus } from '../../../../shared/domain/event.bus';
import { CartCheckoutRequestedEvent } from '../../domain/events/cart-checkout-requested.event';
import type { CartCheckoutCompletedEvent } from '../../domain/events/cart-checkout-completed.event';
import {
  ResolveCartService,
  type CartRequestContext,
} from '../services/resolve-cart.service';
import { BuildCartItemService } from '../services/build-cart-item.service';
import { CreatePaymentIntentOutput } from '../dto/create-payment-intent.output';

@Injectable()
export class CheckoutCartUseCase {
  constructor(
    private readonly resolveCartService: ResolveCartService,
    private readonly buildCartItemService: BuildCartItemService,
  ) {}

  async execute(
    authId: number,
    context: CartRequestContext,
  ): Promise<CreatePaymentIntentOutput> {
    const cart = await this.resolveCartService.resolve({
      ...context,
      authId,
    });

    if (!cart.id || cart.items.length === 0) {
      throw new BadRequestException('Votre panier est vide.');
    }

    if (!cart.userId) {
      throw new UnauthorizedException('Connexion requise pour payer.');
    }

    const items = this.buildCartItemService.buildCheckoutItems(cart);
    if (items.length === 0) {
      throw new BadRequestException('Aucun article payable dans le panier.');
    }

    const correlationId = randomUUID();
    const amountInCents = Math.round(cart.totalPrice * 100);
    const waitForCompletion = EventBus.getInstance().waitOnce<CartCheckoutCompletedEvent>(
      'cart.checkout.completed',
      (event) => event.correlationId === correlationId,
    );

    await EventBus.getInstance().publish(
      new CartCheckoutRequestedEvent(
        correlationId,
        authId,
        cart.id,
        amountInCents,
        items,
      ),
    );

    const completed = await waitForCompletion;

    return new CreatePaymentIntentOutput(
      completed.paymentId,
      completed.clientSecret,
      completed.amountInCents,
      completed.currency,
      completed.publishableKey,
    );
  }
}
