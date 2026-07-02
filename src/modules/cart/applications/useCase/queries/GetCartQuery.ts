import type { CartRequestContext } from '../../services/resolve-cart.service';

export class GetCartQuery {
  constructor(public readonly context: CartRequestContext) {}
}
