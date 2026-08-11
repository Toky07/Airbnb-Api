import { UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import type { CompleteCartCheckoutCommand } from '@src/modules/cart/applications/useCase/commands/CompleteCartCheckoutCommand';
import { EventBus } from '@src/shared/domain/event.bus';
import { CartCheckoutCompleteRequestedEvent } from '@src/modules/cart/domain/events/cart-checkout-complete-requested.event';
import type { CartCheckoutCompleteVerifiedEvent } from '@src/modules/cart/domain/events/cart-checkout-complete-verified.event';
import type { CartOutput } from '@src/modules/cart/applications/dto/cart.output';
import type { ICartUserPort } from '@src/modules/cart/domain/ports/cart-user.port';
import type { ICartRepository } from '@src/modules/cart/domain/repositories/cart.repository';
import type { CartPresenter } from '@src/modules/cart/applications/presenters/cart.presenter';
import type { ResolveCartService } from '@src/modules/cart/applications/services/resolve-cart.service';

export class CompleteCartCheckoutCommandHandler implements ICommandHandler<
  CompleteCartCheckoutCommand,
  CartOutput
> {
  constructor(
    private readonly cartRepository: ICartRepository,
    private readonly cartUserPort: ICartUserPort,
    private readonly resolveCartService: ResolveCartService,
    private readonly cartPresenter: CartPresenter,
  ) {}

  async execute(command: CompleteCartCheckoutCommand): Promise<CartOutput> {
    const user = await this.cartUserPort.findByAuthId(command.authId);
    if (!user?.id) {
      throw new UnauthorizedException('Utilisateur introuvable.');
    }

    const correlationId = randomUUID();
    const waitForVerification =
      EventBus.getInstance().waitOnce<CartCheckoutCompleteVerifiedEvent>(
        'cart.checkout.complete.verified',
        (event) => event.correlationId === correlationId,
      );

    try {
      await EventBus.getInstance().publish(
        new CartCheckoutCompleteRequestedEvent(
          correlationId,
          command.authId,
          Number(command.paymentId),
        ),
      );
    } catch (error) {
      waitForVerification.cancel();
      throw error;
    }

    const verified = await waitForVerification.promise;
    await this.cartRepository.clearItems(verified.cartId);

    const cart = await this.resolveCartService.resolve({
      ...command.context,
      authId: command.authId,
    });

    return this.cartPresenter.toOutput(cart);
  }
}
