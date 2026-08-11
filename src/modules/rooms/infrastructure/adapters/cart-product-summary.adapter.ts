import { Injectable } from '@nestjs/common';
import {
  CART_PRODUCT_SUMMARY_PORT,
  type CartProductSummary,
  type ICartProductSummaryPort,
} from '../../../cart/contracts';
import { RoomProductSummaryService } from '../../applications/services/room-product-summary.service';

@Injectable()
export class CartProductSummaryAdapter implements ICartProductSummaryPort {
  constructor(private readonly roomProductSummary: RoomProductSummaryService) {}

  async getByRoomIds(
    roomIds: number[],
  ): Promise<Map<number, CartProductSummary>> {
    const summaries = await this.roomProductSummary.getByRoomIds(roomIds);
    const mapped = new Map<number, CartProductSummary>();

    for (const [roomId, summary] of summaries.entries()) {
      mapped.set(roomId, {
        roomName: summary.roomName,
        roomSlug: summary.roomSlug,
        propertyName: summary.propertyName,
        propertyCity: summary.propertyCity,
        imageUrl: summary.imageUrl,
      });
    }

    return mapped;
  }
}

export const cartProductSummaryProvider = {
  provide: CART_PRODUCT_SUMMARY_PORT,
  useClass: CartProductSummaryAdapter,
};
