import type { CartRequestContext } from '@src/modules/cart/applications/services/resolve-cart.service';

export class CheckoutCartCommand {
  constructor(
    public readonly authId: number,
    public readonly context: CartRequestContext,
  ) {}
}
