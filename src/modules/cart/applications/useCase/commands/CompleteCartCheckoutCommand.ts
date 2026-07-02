import type { CartRequestContext } from '../../services/resolve-cart.service';

export class CompleteCartCheckoutCommand {
  constructor(
    public readonly authId: number,
    public readonly paymentId: number,
    public readonly context: CartRequestContext,
  ) {}
}
