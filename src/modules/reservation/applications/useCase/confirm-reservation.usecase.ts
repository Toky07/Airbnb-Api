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
import { EnrichReservationOutputsService } from '../services/enrich-reservation-outputs.service';

@Injectable()
export class ConfirmReservationUseCase {
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: IReservationRepository,
    private readonly enrichReservationOutputs: EnrichReservationOutputsService,
  ) {}

  async execute(id: number): Promise<ReservationOutput> {
    const reservation = await this.reservationRepository.findById(id);

    if (!reservation?.id) {
      throw new NotFoundException('Réservation introuvable.');
    }

    if (
      reservation.items.every((item) => item.status === RESERVATION_STATUS.CANCELLED)
    ) {
      throw new BadRequestException(
        'Impossible de confirmer une réservation annulée.',
      );
    }

    const updatedItems: ReservationItem[] = [];

    for (const item of reservation.items) {
      if (item.status === RESERVATION_STATUS.CANCELLED) {
        updatedItems.push(item);
        continue;
      }

      if (item.status === RESERVATION_STATUS.CONFIRMED) {
        updatedItems.push(item);
        continue;
      }

      updatedItems.push(
        await this.reservationRepository.updateItem(
          new ReservationItem(
            item.reservationId,
            item.roomId,
            item.checkIn,
            item.checkOut,
            item.guestCount,
            item.price,
            item.nights,
            RESERVATION_STATUS.CONFIRMED,
            item.id,
            item.createdAt,
            item.updatedAt,
          ),
        ),
      );
    }

    const updated = await this.reservationRepository.findById(reservation.id);
    if (!updated) {
      throw new NotFoundException('Réservation introuvable.');
    }

    const [enriched] = await this.enrichReservationOutputs.enrich([
      ReservationOutput.fromDomain(updated),
    ]);

    return enriched ?? ReservationOutput.fromDomain(updated);
  }
}
