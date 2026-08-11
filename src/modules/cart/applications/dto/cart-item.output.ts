import type { CartItemType } from '@src/modules/cart/domain/constants/cart-item-type.constant';
import type { CartItem } from '@src/modules/cart/domain/entities/cart-item.entity';

export class CartItemOutput {
  constructor(
    public readonly id: number,
    public readonly itemType: CartItemType,
    public readonly label: string,
    public readonly unitPrice: number,
    public readonly totalPrice: number,
    public readonly quantity: number,
    public readonly propertyId: number | null,
    public readonly roomId: number | null,
    public readonly serviceId: number | null,
    public readonly startDate: string | null,
    public readonly endDate: string | null,
    public readonly guestCount: number | null,
    public readonly nights: number | null,
    public readonly roomName: string | null,
    public readonly roomSlug: string | null,
    public readonly propertyName: string | null,
    public readonly propertyCity: string | null,
    public readonly imageUrl: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static fromDomain(item: CartItem): CartItemOutput {
    return new CartItemOutput(
      item.id!,
      item.itemType,
      item.label,
      item.unitPrice,
      item.totalPrice,
      item.quantity,
      item.propertyId,
      item.roomId,
      item.serviceId,
      item.startDate,
      item.endDate,
      item.guestCount,
      item.nights,
      null,
      null,
      null,
      null,
      null,
      item.createdAt!,
      item.updatedAt!,
    );
  }
}
