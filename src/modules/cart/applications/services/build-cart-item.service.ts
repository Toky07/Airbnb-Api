import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CART_ITEM_TYPE } from '@src/modules/cart/domain/constants/cart-item-type.constant';
import { CartItem } from '@src/modules/cart/domain/entities/cart-item.entity';
import type { Cart } from '@src/modules/cart/domain/entities/cart.entity';
import {
  CART_ITEM_CATALOG_PORT,
  type ICartItemCatalogPort,
} from '@src/modules/cart/domain/ports/cart-item-catalog.port';
import type { CartCheckoutItemPayload } from '@src/modules/cart/domain/events/cart-checkout-requested.event';

@Injectable()
export class BuildCartItemService {
  constructor(
    @Inject(CART_ITEM_CATALOG_PORT)
    private readonly cartItemCatalog: ICartItemCatalogPort,
  ) {}

  async fromDto(dto: {
    itemType: (typeof CART_ITEM_TYPE)[keyof typeof CART_ITEM_TYPE];
    roomId?: number;
    startDate?: string;
    endDate?: string;
    guestCount?: number;
    serviceId?: number;
    propertyId?: number;
    label?: string;
    unitPrice?: number;
    quantity?: number;
  }): Promise<CartItem> {
    if (dto.itemType === CART_ITEM_TYPE.RESERVATION) {
      return this.buildReservationItem(dto);
    }

    return this.buildServiceItem(dto);
  }

  buildCheckoutItems(cart: Cart): CartCheckoutItemPayload[] {
    return cart.items
      .filter((item) => item.itemType === CART_ITEM_TYPE.RESERVATION)
      .map((item) => ({
        itemType: item.itemType,
        roomId: item.roomId!,
        startDate: item.startDate!,
        endDate: item.endDate!,
        guestCount: item.guestCount!,
      }));
  }

  private async buildReservationItem(dto: {
    roomId?: number;
    startDate?: string;
    endDate?: string;
    guestCount?: number;
  }): Promise<CartItem> {
    if (!dto.roomId || !dto.startDate || !dto.endDate || !dto.guestCount) {
      throw new BadRequestException('Champs de réservation invalides.');
    }

    const details = await this.cartItemCatalog.buildReservationItem({
      roomId: dto.roomId,
      startDate: dto.startDate,
      endDate: dto.endDate,
      guestCount: dto.guestCount,
    });

    return new CartItem(
      CART_ITEM_TYPE.RESERVATION,
      details.label,
      details.unitPrice,
      details.totalPrice,
      1,
      details.propertyId,
      details.roomId,
      null,
      dto.startDate,
      dto.endDate,
      dto.guestCount,
      details.nights,
    );
  }

  private buildServiceItem(dto: {
    serviceId?: number;
    propertyId?: number;
    label?: string;
    unitPrice?: number;
    quantity?: number;
  }): CartItem {
    if (
      !dto.serviceId ||
      !dto.propertyId ||
      !dto.label?.trim() ||
      dto.unitPrice == null
    ) {
      throw new BadRequestException('Champs de service invalides.');
    }

    const quantity = dto.quantity ?? 1;
    const totalPrice = Number((dto.unitPrice * quantity).toFixed(2));

    return new CartItem(
      CART_ITEM_TYPE.SERVICE,
      dto.label.trim(),
      dto.unitPrice,
      totalPrice,
      quantity,
      dto.propertyId,
      null,
      dto.serviceId,
      null,
      null,
      null,
      null,
    );
  }
}
