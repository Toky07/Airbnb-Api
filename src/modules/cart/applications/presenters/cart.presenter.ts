import { Inject, Injectable } from '@nestjs/common';
import {
  CART_PRODUCT_SUMMARY_PORT,
  type CartProductSummary,
  type ICartProductSummaryPort,
} from '../../domain/ports/cart-product-summary.port';
import { Cart } from '../../domain/entities/cart.entity';
import type { CartItem } from '../../domain/entities/cart-item.entity';
import { CartItemOutput } from '../dto/cart-item.output';
import { CartOutput } from '../dto/cart.output';
import { PricingBreakdownOutput } from '../dto/pricing-breakdown.output';
import { BuildCartPricingBreakdownService } from '../services/build-cart-pricing-breakdown.service';

@Injectable()
export class CartPresenter {
  constructor(
    @Inject(CART_PRODUCT_SUMMARY_PORT)
    private readonly productSummaryPort: ICartProductSummaryPort,
    private readonly buildCartPricingBreakdown: BuildCartPricingBreakdownService,
  ) {}

  async toOutput(cart: Cart): Promise<CartOutput> {
    const roomIds = cart.items
      .map((item) => item.roomId)
      .filter((roomId): roomId is number => roomId != null);

    const summaries = await this.productSummaryPort.getByRoomIds(roomIds);
    const pricingBreakdown = await this.safePricingBreakdown(cart);

    return new CartOutput(
      cart.id!,
      cart.sessionId,
      cart.userId,
      cart.items.map((item) => this.toItemOutput(item, summaries)),
      cart.totalPrice,
      cart.itemCount,
      cart.createdAt!,
      cart.updatedAt!,
      pricingBreakdown,
    );
  }

  private async safePricingBreakdown(
    cart: Cart,
  ): Promise<PricingBreakdownOutput | null> {
    if (cart.items.length === 0) {
      return null;
    }

    try {
      const breakdown =
        await this.buildCartPricingBreakdown.buildFromCart(cart);
      return PricingBreakdownOutput.fromDomain(breakdown);
    } catch {
      return null;
    }
  }

  private toItemOutput(
    item: CartItem,
    summaries: Map<number, CartProductSummary>,
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
