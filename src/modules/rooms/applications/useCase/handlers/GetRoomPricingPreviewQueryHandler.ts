import { BadRequestException } from '@nestjs/common';
import type { IQueryHandler } from '@src/shared/useCase/bus/query-handler.interface';
import { PricingBreakdownOutput } from '@src/shared/pricing/pricing-breakdown.output';
import type { ComputePricingBreakdownService } from '@src/shared/pricing/compute-pricing-breakdown.service';
import type { IRoomRepository } from '@src/modules/rooms/domain/repositories/room.repository';
import type { RoomStayPricingService } from '@src/modules/rooms/applications/services/room-stay-pricing.service';
import type { GetRoomPricingPreviewQuery } from '@src/modules/rooms/applications/useCase/queries/GetRoomPricingPreviewQuery';

export class GetRoomPricingPreviewQueryHandler implements IQueryHandler<
  GetRoomPricingPreviewQuery,
  PricingBreakdownOutput
> {
  constructor(
    private readonly roomRepository: IRoomRepository,
    private readonly roomStayPricing: RoomStayPricingService,
    private readonly computePricingBreakdown: ComputePricingBreakdownService,
  ) {}

  async execute(
    query: GetRoomPricingPreviewQuery,
  ): Promise<PricingBreakdownOutput> {
    const room = query.slug
      ? await this.roomRepository.findBySlug(query.slug)
      : query.roomId
        ? await this.roomRepository.findById(query.roomId)
        : null;

    if (!room?.id) {
      throw new BadRequestException('Chambre introuvable.');
    }

    if (query.guestCount > room.maxGuests) {
      throw new BadRequestException(
        `Cette chambre accepte au maximum ${room.maxGuests} voyageurs.`,
      );
    }

    const stayPricing = await this.roomStayPricing.resolveForRoom(
      room,
      query.startDate,
      query.endDate,
    );

    const breakdown = this.computePricingBreakdown.execute([
      {
        checkIn: query.startDate,
        checkOut: query.endDate,
        pricePerNight: stayPricing.averagePricePerNight,
        guestCount: query.guestCount,
        touristTaxPerGuestNight: room.property?.touristTaxPerGuestNight ?? 0,
        roomId: room.id,
        propertyId: room.property?.id ?? null,
      },
    ]);

    return PricingBreakdownOutput.fromDomain(breakdown);
  }
}
