import { Injectable } from '@nestjs/common';
import { CartPresenter } from '../presenters/cart.presenter';
import { CartOutput } from '../dto/cart.output';
import {
  ResolveCartService,
  type CartRequestContext,
} from '../services/resolve-cart.service';

@Injectable()
export class GetCartUseCase {
  constructor(private readonly resolveCartService: ResolveCartService) {}

  async execute(context: CartRequestContext): Promise<CartOutput> {
    const cart = await this.resolveCartService.resolve(context);
    return CartPresenter.toOutput(cart);
  }
}
