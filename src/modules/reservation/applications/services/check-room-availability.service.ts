import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  RESERVATION_REPOSITORY,
  type IReservationRepository,
} from '../../domain/repositories/reservation.repository';

@Injectable()
export class CheckRoomAvailabilityService {
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: IReservationRepository,
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
  }
}
