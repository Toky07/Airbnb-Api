import { Inject, Injectable } from '@nestjs/common';
import {
  ROOM_REPOSITORY,
  type IRoomRepository,
} from '../../../rooms/domain/repositories/room.repository';
import type { ReservationPaymentContext } from '../../../payment/domain/types/reservation-payment-context.type';
import type { ReservationOutput } from '../dto/reservation.output';

@Injectable()
export class BuildReservationPaymentContextService {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
  ) {}

  async fromReservation(
    reservation: ReservationOutput,
  ): Promise<ReservationPaymentContext> {
    if (!reservation.id) {
      throw new Error('Reservation id is required to build payment context.');
    }

    const propertyIds = new Set<number>();

    for (const item of reservation.items) {
      if (item.propertyId != null && item.propertyId > 0) {
        propertyIds.add(item.propertyId);
        continue;
      }

      const room = await this.roomRepository.findById(item.roomId);
      const propertyId = room?.property?.id;
      if (propertyId != null && propertyId > 0) {
        propertyIds.add(propertyId);
      }
    }

    if (propertyIds.size === 0) {
      throw new Error('Reservation items are missing propertyId.');
    }

    const roomIds = reservation.items.map((item) => item.roomId);
    const checkIns = reservation.items.map((item) => item.checkIn).sort();
    const checkOuts = reservation.items.map((item) => item.checkOut).sort();

    return {
      reservationId: reservation.id,
      propertyIds: [...propertyIds],
      roomIds,
      checkIn: checkIns[0]!,
      checkOut: checkOuts[checkOuts.length - 1]!,
    };
  }
}
