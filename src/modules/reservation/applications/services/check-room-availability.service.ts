import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  RESERVATION_REPOSITORY,
  type IReservationRepository,
} from '../../domain/repositories/reservation.repository';
import {
  ROOM_BLOCKED_DATE_REPOSITORY,
  type IRoomBlockedDateRepository,
} from '../../../rooms/domain/repositories/room-blocked-date.repository';

@Injectable()
export class CheckRoomAvailabilityService {
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: IReservationRepository,
    @Inject(ROOM_BLOCKED_DATE_REPOSITORY)
    private readonly blockedDateRepository: IRoomBlockedDateRepository,
  ) {}

  async ensureAvailable(
    roomId: number,
    startDate: string,
    endDate: string,
    excludeReservationId?: number,
  ): Promise<void> {
    const overlapping = await this.reservationRepository.findOverlapping(
      roomId,
      startDate,
      endDate,
      excludeReservationId,
    );

    if (overlapping.length > 0) {
      throw new BadRequestException(
        'Cette chambre n’est pas disponible pour les dates sélectionnées.',
      );
    }

    const blocked = await this.blockedDateRepository.findOverlapping(
      roomId,
      startDate,
      endDate,
    );

    if (blocked.length > 0) {
      throw new BadRequestException(
        'Cette chambre n’est pas disponible pour les dates sélectionnées.',
      );
    }
  }
}
