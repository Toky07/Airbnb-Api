import type { CartRequestContext } from '../../services/resolve-cart.service';

export class RemoveCartItemCommand {
  constructor(
    public readonly context: CartRequestContext,
    public readonly itemId: number,
  ) {}
}
