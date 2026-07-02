import type { CartRequestContext } from '../../services/resolve-cart.service';

export class CheckoutCartCommand {
  constructor(
    public readonly authId: number,
    public readonly context: CartRequestContext,
  ) {}
}
