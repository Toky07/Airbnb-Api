import type { CartItemType } from '../../domain/constants/cart-item-type.constant';
import { Cart } from '../../domain/entities/cart.entity';
import { CartItem } from '../../domain/entities/cart-item.entity';
import { CartItemOrmEntity } from '../entities/cart-item.orm-entity';
import { CartOrmEntity } from '../entities/cart.orm-entity';

export class CartMapper {
  static toDomain(entity: CartOrmEntity): Cart {
    return new Cart(
      entity.sessionId,
      (entity.items ?? []).map((item) => CartMapper.itemToDomain(item)),
      entity.userId,
      entity.id,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static toEntity(cart: Cart): CartOrmEntity {
    const entity = new CartOrmEntity();
    if (cart.id !== undefined) {
      entity.id = cart.id;
    }
    entity.sessionId = cart.sessionId;
    entity.userId = cart.userId;
    entity.items = cart.items.map((item) => CartMapper.itemToEntity(item, cart.id));
    return entity;
  }

  static itemToDomain(entity: CartItemOrmEntity): CartItem {
    return new CartItem(
      entity.itemType as CartItemType,
      entity.label,
      entity.unitPrice,
      entity.totalPrice,
      entity.quantity,
      entity.propertyId,
      entity.roomId,
      entity.serviceId,
      entity.startDate,
      entity.endDate,
      entity.guestCount,
      entity.nights,
      entity.id,
      entity.cartId,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static itemToEntity(item: CartItem, cartId?: number): CartItemOrmEntity {
    const entity = new CartItemOrmEntity();
    if (item.id !== undefined) {
      entity.id = item.id;
    }
    entity.itemType = item.itemType;
    entity.label = item.label;
    entity.unitPrice = item.unitPrice;
    entity.totalPrice = item.totalPrice;
    entity.quantity = item.quantity;
    entity.propertyId = item.propertyId;
    entity.roomId = item.roomId;
    entity.serviceId = item.serviceId;
    entity.startDate = item.startDate;
    entity.endDate = item.endDate;
    entity.guestCount = item.guestCount;
    entity.nights = item.nights;
    entity.cartId = cartId ?? item.cartId ?? 0;
    return entity;
  }
}
