import type { CartItem } from './cart-item.entity';

export class Cart {
  constructor(
    public readonly sessionId: string,
    public readonly items: CartItem[],
    public readonly userId: number | null = null,
    public readonly id?: number,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}

  get totalPrice(): number {
    return Number(
      this.items.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2),
    );
  }

  get itemCount(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }
}
