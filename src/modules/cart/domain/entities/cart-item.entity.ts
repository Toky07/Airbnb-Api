import type { CartItemType } from '@src/modules/cart/domain/constants/cart-item-type.constant';

export class CartItem {
  constructor(
    public readonly itemType: CartItemType,
    public readonly label: string,
    public readonly unitPrice: number,
    public readonly totalPrice: number,
    public readonly quantity: number,
    public readonly propertyId: number | null,
    public readonly roomId: number | null = null,
    public readonly serviceId: number | null = null,
    public readonly startDate: string | null = null,
    public readonly endDate: string | null = null,
    public readonly guestCount: number | null = null,
    public readonly nights: number | null = null,
    public readonly id?: number,
    public readonly cartId?: number,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
