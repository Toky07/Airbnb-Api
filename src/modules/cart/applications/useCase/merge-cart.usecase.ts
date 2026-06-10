import {
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Cart } from '../../domain/entities/cart.entity';
import {
  CART_REPOSITORY,
  type ICartRepository,
} from '../../domain/repositories/cart.repository';
import { USER_REPOSITORY } from '../../../user/infrastructure/repositories/user.repository';
import type { IUserRepository } from '../../../user/domain/repositories/user.repository';
import { CartOutput } from '../dto/cart.output';
import { CartPresenter } from '../presenters/cart.presenter';

@Injectable()
export class MergeCartUseCase {
  constructor(
    @Inject(CART_REPOSITORY)
    private readonly cartRepository: ICartRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly cartPresenter: CartPresenter,
  ) {}

  async execute(authId: number, sessionId?: string | null): Promise<CartOutput> {
    const user = await this.userRepository.findByAuthId(authId);
    if (!user?.id) {
      throw new UnauthorizedException('Utilisateur introuvable.');
    }

    const guestCart = sessionId?.trim()
      ? await this.cartRepository.findBySessionId(sessionId.trim())
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
