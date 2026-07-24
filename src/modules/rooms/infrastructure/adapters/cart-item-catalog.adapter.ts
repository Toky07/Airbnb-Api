import { Inject, Injectable } from '@nestjs/common';
import { CalculateStayAmountService } from '../../../../shared/pricing/calculate-stay-amount.service';
import {
  CART_ITEM_CATALOG_PORT,
  type ICartItemCatalogPort,
  type ReservationCartItemDetails,
  type ReservationCartItemInput,
} from '../../../cart/domain/ports/cart-item-catalog.port';
import {
  ROOM_REPOSITORY,
  type IRoomRepository,
} from '../../domain/repositories/room.repository';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RoomStayPricingService } from '../../applications/services/room-stay-pricing.service';

@Injectable()
export class CartItemCatalogAdapter implements ICartItemCatalogPort {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
    private readonly calculateStayAmount: CalculateStayAmountService,
    private readonly roomStayPricing: RoomStayPricingService,
  ) {}

  async buildReservationItem(
    input: ReservationCartItemInput,
  ): Promise<ReservationCartItemDetails> {
    return this.resolveReservationItem(input);
  }

  async updateReservationItem(
    input: ReservationCartItemInput & { currentLabel: string },
  ): Promise<ReservationCartItemDetails> {
    return this.resolveReservationItem(input);
  }

  private async resolveReservationItem(
    input: ReservationCartItemInput,
  ): Promise<ReservationCartItemDetails> {
    const room = await this.roomRepository.findById(input.roomId);
    if (!room?.id) {
      throw new NotFoundException('Chambre introuvable.');
    }

    if (room.status !== 'available') {
      throw new BadRequestException('Cette chambre n’est pas disponible.');
    }

    if (input.guestCount > room.maxGuests) {
      throw new BadRequestException(
        `Cette chambre accepte au maximum ${room.maxGuests} voyageurs.`,
      );
    }

    const stayPricing = await this.roomStayPricing.resolveForRoom(
      room,
      input.startDate,
      input.endDate,
    );

    return {
      label: `${room.name} · ${room.property?.name ?? 'Établissement'}`,
      unitPrice: stayPricing.averagePricePerNight,
      totalPrice: stayPricing.amountInMajorUnit,
      nights: stayPricing.nights,
      propertyId: room.property?.id ?? null,
      roomId: room.id,
    };
  }
}

export const cartItemCatalogProvider = {
  provide: CART_ITEM_CATALOG_PORT,
  useClass: CartItemCatalogAdapter,
};
