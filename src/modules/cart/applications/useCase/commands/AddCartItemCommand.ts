import type { AddCartItemDto } from '../../dto/add-cart-item.dto';
import type { CartRequestContext } from '../../services/resolve-cart.service';

export class AddCartItemCommand {
  constructor(
    public readonly context: CartRequestContext,
    public readonly dto: AddCartItemDto,
  ) {}
}
