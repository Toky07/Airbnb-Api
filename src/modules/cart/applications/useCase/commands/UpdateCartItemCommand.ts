import type { UpdateCartItemDto } from '../../dto/add-cart-item.dto';
import type { CartRequestContext } from '../../services/resolve-cart.service';

export class UpdateCartItemCommand {
  constructor(
    public readonly context: CartRequestContext,
    public readonly itemId: number,
    public readonly dto: UpdateCartItemDto,
  ) {}
}
