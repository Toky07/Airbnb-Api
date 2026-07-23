import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ComputePricingBreakdownService } from '../../../../shared/pricing/compute-pricing-breakdown.service';
import type { PricingBreakdown } from '../../../../shared/pricing/pricing-breakdown.types';
import type { PricingLineInput } from '../../../../shared/pricing/pricing-breakdown.types';
import { CART_ITEM_TYPE } from '../../domain/constants/cart-item-type.constant';
import type { Cart } from '../../domain/entities/cart.entity';
import {
  ROOM_REPOSITORY,
  type IRoomRepository,
} from '../../../rooms/domain/repositories/room.repository';

@Injectable()
export class BuildCartPricingBreakdownService {
  constructor(
    private readonly computePricingBreakdown: ComputePricingBreakdownService,
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
  ) {}

  async buildFromCart(cart: Cart): Promise<PricingBreakdown> {
    const lines = await this.buildLines(cart);
    if (lines.length === 0) {
      throw new BadRequestException('Aucune ligne tarifable dans le panier.');
    }

    return this.computePricingBreakdown.execute(lines);
  }

  async buildFromReservationInput(input: {
    roomId: number;
    startDate: string;
    endDate: string;
    guestCount: number;
  }): Promise<PricingBreakdown> {
    const room = await this.roomRepository.findById(input.roomId);
    if (!room?.id) {
      throw new BadRequestException('Chambre introuvable.');
    }

    return this.computePricingBreakdown.execute([
      {
        checkIn: input.startDate,
        checkOut: input.endDate,
        pricePerNight: room.pricePerNight,
        guestCount: input.guestCount,
        touristTaxPerGuestNight: room.property?.touristTaxPerGuestNight ?? 0,
        roomId: room.id,
        propertyId: room.property?.id ?? null,
      },
    ]);
  }

  private async buildLines(cart: Cart): Promise<PricingLineInput[]> {
    const reservationItems = cart.items.filter(
      (item) => item.itemType === CART_ITEM_TYPE.RESERVATION,
    );

    const lines: PricingLineInput[] = [];

    for (const item of reservationItems) {
      if (
        !item.roomId ||
        !item.startDate ||
        !item.endDate ||
        !item.guestCount
      ) {
        continue;
      }

      const room = await this.roomRepository.findById(item.roomId);
      if (!room?.id) {
        continue;
      }

      lines.push({
        checkIn: item.startDate,
        checkOut: item.endDate,
        pricePerNight: item.unitPrice,
        guestCount: item.guestCount,
        touristTaxPerGuestNight: room.property?.touristTaxPerGuestNight ?? 0,
        roomId: item.roomId,
        propertyId: item.propertyId,
      });
    }

    return lines;
  }
}
