import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  CART_REPOSITORY,
  type ICartRepository,
} from '../../domain/repositories/cart.repository';
import { CartOutput } from '../dto/cart.output';
import { CartPresenter } from '../presenters/cart.presenter';
import {
  ResolveCartService,
  type CartRequestContext,
} from '../services/resolve-cart.service';

@Injectable()
export class RemoveCartItemUseCase {
  constructor(
    private readonly resolveCartService: ResolveCartService,
    @Inject(CART_REPOSITORY)
    private readonly cartRepository: ICartRepository,
    private readonly cartPresenter: CartPresenter,
  ) {}

  async execute(
    context: CartRequestContext,
    itemId: number,
  ): Promise<CartOutput> {
    const cart = await this.resolveCartService.resolve(context);
    const item = cart.items.find((entry) => entry.id === Number(itemId));

    if (!item?.id || !cart.id) {
      throw new NotFoundException('Article introuvable.');
    }

    await this.cartRepository.removeItem(item.id);
    const reloaded = await this.cartRepository.findById(cart.id);
    return this.cartPresenter.toOutput(reloaded!);
  }
}
