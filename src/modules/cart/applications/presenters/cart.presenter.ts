import { Injectable } from '@nestjs/common';
import {
  RoomProductSummaryService,
  type RoomProductSummary,
} from '../../../rooms/applications/services/room-product-summary.service';
import { Cart } from '../../domain/entities/cart.entity';
import type { CartItem } from '../../domain/entities/cart-item.entity';
import { CartItemOutput } from '../dto/cart-item.output';
import { CartOutput } from '../dto/cart.output';

@Injectable()
export class CartPresenter {
  constructor(
    private readonly roomProductSummary: RoomProductSummaryService,
  ) {}

  async toOutput(cart: Cart): Promise<CartOutput> {
    const roomIds = cart.items
      .map((item) => item.roomId)
      .filter((roomId): roomId is number => roomId != null);

    const summaries = await this.roomProductSummary.getByRoomIds(roomIds);

    return new CartOutput(
      cart.id!,
      cart.sessionId,
      cart.userId,
      cart.items.map((item) => this.toItemOutput(item, summaries)),
      cart.totalPrice,
      cart.itemCount,
      cart.createdAt!,
      cart.updatedAt!,
    );
  }

  private toItemOutput(
    item: CartItem,
    summaries: Map<number, RoomProductSummary>,
  ): CartItemOutput {
    const summary = item.roomId ? summaries.get(item.roomId) : undefined;

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
      summary?.roomName ?? null,
      summary?.roomSlug ?? null,
      summary?.propertyName ?? null,
      summary?.propertyCity ?? null,
      summary?.imageUrl ?? null,
      item.createdAt!,
      item.updatedAt!,
    );
  }
}
