import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Cart } from '../../domain/entities/cart.entity';
import {
  CART_REPOSITORY,
  type ICartRepository,
} from '../../domain/repositories/cart.repository';
import {
  CART_USER_PORT,
  type ICartUserPort,
} from '../../domain/ports/cart-user.port';

export type CartRequestContext = {
  sessionId?: string | null;
  authId?: number | null;
};

@Injectable()
export class ResolveCartService {
  constructor(
    @Inject(CART_REPOSITORY)
    private readonly cartRepository: ICartRepository,
    @Inject(CART_USER_PORT)
    private readonly cartUserPort: ICartUserPort,
  ) {}

  async resolve(context: CartRequestContext): Promise<Cart> {
    const user = context.authId
      ? await this.cartUserPort.findByAuthId(context.authId)
      : null;

    if (user?.id) {
      const userCart = await this.cartRepository.findByUserId(user.id);
      if (userCart?.id) {
        return userCart;
      }

      const sessionCart = context.sessionId
        ? await this.cartRepository.findBySessionId(context.sessionId)
        : null;

      if (sessionCart?.id) {
        return this.cartRepository.save(
          new Cart(
            sessionCart.sessionId,
            sessionCart.items,
            user.id,
            sessionCart.id,
            sessionCart.createdAt,
            sessionCart.updatedAt,
          ),
        );
      }

      return this.cartRepository.create(new Cart(randomUUID(), [], user.id));
    }

    if (context.sessionId?.trim()) {
      const existing = await this.cartRepository.findBySessionId(
        context.sessionId.trim(),
      );
      if (existing?.id) {
        return existing;
      }
    }

    return this.cartRepository.create(
      new Cart(context.sessionId?.trim() || randomUUID(), [], null),
    );
  }
}
