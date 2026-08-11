import type { CartRequestContext } from '@src/modules/cart/applications/services/resolve-cart.service';

export class RemoveCartItemCommand {
  constructor(
    public readonly context: CartRequestContext,
    public readonly itemId: number,
  ) {}
}
