import { UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import type { MergeCartCommand } from '../commands/MergeCartCommand';
import type { CartOutput } from '../../dto/cart.output';
import { Cart } from '../../../domain/entities/cart.entity';
import type { ICartUserPort } from '../../../domain/ports/cart-user.port';
import type { ICartRepository } from '../../../domain/repositories/cart.repository';
import type { CartPresenter } from '../../presenters/cart.presenter';

export class MergeCartCommandHandler implements ICommandHandler<
  MergeCartCommand,
  CartOutput
> {
  constructor(
    private readonly cartRepository: ICartRepository,
    private readonly cartUserPort: ICartUserPort,
    private readonly cartPresenter: CartPresenter,
  ) {}

  async execute(command: MergeCartCommand): Promise<CartOutput> {
    const user = await this.cartUserPort.findByAuthId(command.authId);
    if (!user?.id) {
      throw new UnauthorizedException('Utilisateur introuvable.');
    }

    const guestCart = command.sessionId?.trim()
      ? await this.cartRepository.findBySessionId(command.sessionId.trim())
      : null;
    let userCart = await this.cartRepository.findByUserId(user.id);

    if (!userCart?.id) {
      if (guestCart?.id) {
        userCart = await this.cartRepository.save(
          new Cart(
            guestCart.sessionId,
            guestCart.items,
            user.id,
            guestCart.id,
            guestCart.createdAt,
            guestCart.updatedAt,
          ),
        );
      } else {
        userCart = await this.cartRepository.create(
          new Cart(randomUUID(), [], user.id),
        );
      }
    } else if (guestCart?.id && guestCart.id !== userCart.id) {
      await this.cartRepository.moveItems(guestCart.id, userCart.id);
      await this.cartRepository.delete(guestCart.id);
      userCart = (await this.cartRepository.findById(userCart.id))!;
    }

    if (userCart.userId !== user.id) {
      userCart = await this.cartRepository.save(
        new Cart(
          userCart.sessionId,
          userCart.items,
          user.id,
          userCart.id,
          userCart.createdAt,
          userCart.updatedAt,
        ),
      );
    }

    return this.cartPresenter.toOutput(userCart);
  }
}
