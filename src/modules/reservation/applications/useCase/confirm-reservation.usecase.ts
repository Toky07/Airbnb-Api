import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RESERVATION_STATUS } from '../../domain/constants/reservation-status.constant';
import { ReservationItem } from '../../domain/entities/reservation-item.entity';
import {
  RESERVATION_REPOSITORY,
  type IReservationRepository,
} from '../../domain/repositories/reservation.repository';
import { ReservationOutput } from '../dto/reservation.output';
import { Reservation } from '../../domain/entities/reservation.entity';

@Injectable()
export class ConfirmReservationUseCase {
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: IReservationRepository,
  ) {}

  async execute(id: number): Promise<ReservationOutput> {
    const reservation = await this.reservationRepository.findById(id);

    if (!reservation?.id) {
      throw new NotFoundException('Réservation introuvable.');
    }

    if (reservation.status === RESERVATION_STATUS.CANCELLED) {
      throw new BadRequestException(
        'Impossible de confirmer une réservation annulée.',
      );
    }

    const updated = await this.reservationRepository.update(
      new Reservation(
        reservation.userId,
        reservation.items,
        RESERVATION_STATUS.CONFIRMED,
        undefined,
        reservation.id,
        reservation.createdAt,
        reservation.updatedAt,
      ),
    );

    return ReservationOutput.fromDomain(updated);
  }
}
