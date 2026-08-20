import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import type { CheckoutCartCommand } from '@src/modules/cart/applications/useCase/commands/CheckoutCartCommand';
import { EventBus } from '@src/shared/domain/event.bus';
import { CartCheckoutRequestedEvent } from '@src/modules/cart/domain/events/cart-checkout-requested.event';
import type { CartCheckoutCompletedEvent } from '@src/modules/cart/domain/events/cart-checkout-completed.event';
import { CreatePaymentIntentOutput } from '@src/modules/cart/applications/dto/create-payment-intent.output';
import { PricingBreakdownOutput } from '@src/shared/pricing/pricing-breakdown.output';
import type { BuildCartItemService } from '@src/modules/cart/applications/services/build-cart-item.service';
import type { ResolveCartService } from '@src/modules/cart/applications/services/resolve-cart.service';
import type { BuildCartPricingBreakdownService } from '@src/modules/cart/applications/services/build-cart-pricing-breakdown.service';
import type { ResolveCartConnectDestinationService } from '@src/modules/cart/applications/services/resolve-cart-connect-destination.service';

export class CheckoutCartCommandHandler implements ICommandHandler<
  CheckoutCartCommand,
  CreatePaymentIntentOutput
> {
  constructor(
    private readonly resolveCartService: ResolveCartService,
    private readonly buildCartItemService: BuildCartItemService,
    private readonly buildCartPricingBreakdown: BuildCartPricingBreakdownService,
    private readonly resolveCartConnectDestination: ResolveCartConnectDestinationService,
  ) {}

  async execute(
    command: CheckoutCartCommand,
  ): Promise<CreatePaymentIntentOutput> {
    const cart = await this.resolveCartService.resolve({
      ...command.context,
      authId: command.authId,
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

    const pricingBreakdown =
      await this.buildCartPricingBreakdown.buildFromCart(cart);
    const destination =
      await this.resolveCartConnectDestination.resolveFromCart(cart);
    const correlationId = randomUUID();
    const waitForCompletion =
      EventBus.getInstance().waitOnce<CartCheckoutCompletedEvent>(
        'cart.checkout.completed',
        (event) => event.correlationId === correlationId,
      );

    try {
      await EventBus.getInstance().publish(
        new CartCheckoutRequestedEvent(
          correlationId,
          command.authId,
          cart.id,
          pricingBreakdown.totalCents,
          items,
          pricingBreakdown,
          destination.stripeAccountId,
          destination.hostUserId,
        ),
      );
    } catch (error) {
      waitForCompletion.cancel();
      throw error;
    }

    const completed = await waitForCompletion.promise;

    return new CreatePaymentIntentOutput(
      completed.paymentId,
      completed.clientSecret,
      completed.amountInCents,
      completed.currency,
      completed.publishableKey,
      completed.holdUntil,
      PricingBreakdownOutput.fromDomain(pricingBreakdown),
    );
  }
}
