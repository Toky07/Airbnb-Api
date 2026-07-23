import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  type IReservationRepository,
  RESERVATION_REPOSITORY,
} from '../../domain/repositories/reservation.repository';
import { Interval } from '@nestjs/schedule';

@Injectable()
export class ClearExpiredReservationService {
  private readonly logger = new Logger(ClearExpiredReservationService.name);

  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: IReservationRepository,
  ) {}

  @Interval(1000 * 60)
  async execute(): Promise<void> {
    await this.reservationRepository.clearExpiredReservations();

    this.logger.log('Cleared expired reservations');
  }
}
