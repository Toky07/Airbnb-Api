import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CalculateStayAmountService } from '../../../../shared/pricing/calculate-stay-amount.service';
import {
  ROOM_REPOSITORY,
  type IRoomRepository,
} from '../../../rooms/domain/repositories/room.repository';
import { CART_ITEM_TYPE } from '../../domain/constants/cart-item-type.constant';
import { CartItem } from '../../domain/entities/cart-item.entity';
import type { AddCartItemDto } from '../dto/add-cart-item.dto';

@Injectable()
export class BuildCartItemService {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
    private readonly calculateStayAmount: CalculateStayAmountService,
  ) {}

  async fromDto(dto: AddCartItemDto): Promise<CartItem> {
    if (dto.itemType === CART_ITEM_TYPE.RESERVATION) {
      return this.buildReservationItem(dto);
    }

    return this.buildServiceItem(dto);
  }

  private async buildReservationItem(dto: AddCartItemDto): Promise<CartItem> {
    if (!dto.roomId || !dto.startDate || !dto.endDate || !dto.guestCount) {
      throw new BadRequestException('Champs de réservation invalides.');
    }

    const room = await this.roomRepository.findById(dto.roomId);
    if (!room?.id) {
      throw new NotFoundException('Chambre introuvable.');
    }

    if (room.status !== 'available') {
      throw new BadRequestException('Cette chambre n’est pas disponible.');
    }

    if (dto.guestCount > room.maxGuests) {
      throw new BadRequestException(
        `Cette chambre accepte au maximum ${room.maxGuests} voyageurs.`,
      );
    }

    const stayAmount = this.calculateStayAmount.execute({
      checkIn: dto.startDate,
      checkOut: dto.endDate,
      pricePerNight: room.pricePerNight,
    });

    const label = `${room.name} · ${room.property?.name ?? 'Établissement'}`;

    return new CartItem(
      CART_ITEM_TYPE.RESERVATION,
      label,
      room.pricePerNight,
      stayAmount.amountInMajorUnit,
      1,
      room.property?.id ?? null,
      room.id,
      null,
      dto.startDate,
      dto.endDate,
      dto.guestCount,
      stayAmount.nights,
    );
  }

  private buildServiceItem(dto: AddCartItemDto): CartItem {
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
