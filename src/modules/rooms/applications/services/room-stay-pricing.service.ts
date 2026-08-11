import { Inject, Injectable } from '@nestjs/common';
import type { Room } from '@src/modules/rooms/domain/entities/room.entity';
import {
  ROOM_RATE_OVERRIDE_REPOSITORY,
  type IRoomRateOverrideRepository,
} from '@src/modules/rooms/domain/repositories/room-rate-override.repository';
import {
  ResolveDynamicStayAmountService,
  type DynamicStayPricingResult,
} from '@src/shared/pricing/resolve-dynamic-stay-amount.service';

@Injectable()
export class RoomStayPricingService {
  constructor(
    private readonly resolveDynamicStayAmount: ResolveDynamicStayAmountService,
    @Inject(ROOM_RATE_OVERRIDE_REPOSITORY)
    private readonly rateOverrideRepository: IRoomRateOverrideRepository,
  ) {}

  async resolveForRoom(
    room: Room,
    checkIn: string,
    checkOut: string,
  ): Promise<DynamicStayPricingResult> {
    if (!room.id) {
      throw new Error('La chambre doit avoir un identifiant.');
    }

    const overrides = await this.rateOverrideRepository.findOverlapping(
      room.id,
      checkIn,
      checkOut,
    );

    return this.resolveDynamicStayAmount.resolve({
      checkIn,
      checkOut,
      pricePerNight: room.pricePerNight,
      weekendPricePerNight: room.weekendPricePerNight,
      rateOverrides: overrides.map((override) => ({
        startDate: override.startDate,
        endDate: override.endDate,
        pricePerNight: override.pricePerNight,
      })),
    });
  }
}
