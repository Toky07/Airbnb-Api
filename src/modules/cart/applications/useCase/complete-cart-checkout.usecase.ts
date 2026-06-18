import {
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { EventBus } from '../../../../shared/domain/event.bus';
import { CartCheckoutCompleteRequestedEvent } from '../../domain/events/cart-checkout-complete-requested.event';
import type { CartCheckoutCompleteVerifiedEvent } from '../../domain/events/cart-checkout-complete-verified.event';
import {
  CART_REPOSITORY,
  type ICartRepository,
} from '../../domain/repositories/cart.repository';
import {
  CART_USER_PORT,
  type ICartUserPort,
} from '../../domain/ports/cart-user.port';
import { CartOutput } from '../dto/cart.output';
import { CartPresenter } from '../presenters/cart.presenter';
import {
  ResolveCartService,
  type CartRequestContext,
} from '../services/resolve-cart.service';

@Injectable()
export class CompleteCartCheckoutUseCase {
  constructor(
    @Inject(CART_REPOSITORY)
    private readonly cartRepository: ICartRepository,
    @Inject(CART_USER_PORT)
    private readonly cartUserPort: ICartUserPort,
    private readonly resolveCartService: ResolveCartService,
    private readonly cartPresenter: CartPresenter,
  ) {}

  async execute(
    authId: number,
    paymentId: number,
    context: CartRequestContext,
  ): Promise<CartOutput> {
    const user = await this.cartUserPort.findByAuthId(authId);
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
        authId,
        Number(paymentId),
      ),
    );

    const verified = await waitForVerification;
    await this.cartRepository.clearItems(verified.cartId);

    const cart = await this.resolveCartService.resolve({
      ...context,
      authId,
    });

    return this.cartPresenter.toOutput(cart);
  }
}
