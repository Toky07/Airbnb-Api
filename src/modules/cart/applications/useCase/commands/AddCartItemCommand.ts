import type { AddCartItemDto } from '@src/modules/cart/applications/dto/add-cart-item.dto';
import type { CartRequestContext } from '@src/modules/cart/applications/services/resolve-cart.service';

export class AddCartItemCommand {
  constructor(
    public readonly context: CartRequestContext,
    public readonly dto: AddCartItemDto,
  ) {}
}
