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
export class ClearCartUseCase {
  constructor(
    private readonly resolveCartService: ResolveCartService,
    @Inject(CART_REPOSITORY)
    private readonly cartRepository: ICartRepository,
  ) {}

  async execute(context: CartRequestContext): Promise<CartOutput> {
    const cart = await this.resolveCartService.resolve(context);

    if (!cart.id) {
      throw new NotFoundException('Panier introuvable.');
    }

    await this.cartRepository.clearItems(cart.id);
    const reloaded = await this.cartRepository.findById(cart.id);
    return CartPresenter.toOutput(reloaded!);
  }
}
