import { Inject, Injectable } from '@nestjs/common';
import {
  CART_USER_PORT,
  type CartUserSnapshot,
  type ICartUserPort,
} from '@src/modules/cart/contracts';
import { USER_REPOSITORY } from '@src/modules/user/domain/repositories/user.repository';
import type { IUserRepository } from '@src/modules/user/domain/repositories/user.repository';

@Injectable()
export class CartUserAdapter implements ICartUserPort {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async findByAuthId(authId: number): Promise<CartUserSnapshot | null> {
    const user = await this.userRepository.findByAuthId(authId);
    if (!user?.id) {
      return null;
    }

    return { id: user.id };
  }
}

export const cartUserProvider = {
  provide: CART_USER_PORT,
  useClass: CartUserAdapter,
};
