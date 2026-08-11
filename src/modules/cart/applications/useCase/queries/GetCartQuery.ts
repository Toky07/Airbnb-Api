import type { CartRequestContext } from '@src/modules/cart/applications/services/resolve-cart.service';

export class GetCartQuery {
  constructor(public readonly context: CartRequestContext) {}
}
