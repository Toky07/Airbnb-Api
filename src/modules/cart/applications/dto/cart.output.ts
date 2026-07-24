import type { CartItemOutput } from './cart-item.output';
import type { PricingBreakdownOutput } from './pricing-breakdown.output';

export class CartOutput {
  constructor(
    public readonly id: number,
    public readonly sessionId: string,
    public readonly userId: number | null,
    public readonly items: CartItemOutput[],
    public readonly totalPrice: number,
    public readonly itemCount: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly pricingBreakdown: PricingBreakdownOutput | null = null,
  ) {}
}
