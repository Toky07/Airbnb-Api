import type { UpdateCartItemDto } from '@src/modules/cart/applications/dto/add-cart-item.dto';
import type { CartRequestContext } from '@src/modules/cart/applications/services/resolve-cart.service';

export class UpdateCartItemCommand {
  constructor(
    public readonly context: CartRequestContext,
    public readonly itemId: number,
    public readonly dto: UpdateCartItemDto,
  ) {}
}
