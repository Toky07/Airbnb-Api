import { UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import type { CompleteCartCheckoutCommand } from '../commands/CompleteCartCheckoutCommand';
import { EventBus } from '../../../../../shared/domain/event.bus';
import { CartCheckoutCompleteRequestedEvent } from '../../../domain/events/cart-checkout-complete-requested.event';
import type { CartCheckoutCompleteVerifiedEvent } from '../../../domain/events/cart-checkout-complete-verified.event';
import type { CartOutput } from '../../dto/cart.output';
import type { ICartUserPort } from '../../../domain/ports/cart-user.port';
import type { ICartRepository } from '../../../domain/repositories/cart.repository';
import type { CartPresenter } from '../../presenters/cart.presenter';
import type { ResolveCartService } from '../../services/resolve-cart.service';

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

    await EventBus.getInstance().publish(
      new CartCheckoutCompleteRequestedEvent(
        correlationId,
        command.authId,
        Number(command.paymentId),
      ),
    );

    const verified = await waitForVerification;
    await this.cartRepository.clearItems(verified.cartId);

    const cart = await this.resolveCartService.resolve({
      ...command.context,
      authId: command.authId,
    });

    return this.cartPresenter.toOutput(cart);
  }
}
