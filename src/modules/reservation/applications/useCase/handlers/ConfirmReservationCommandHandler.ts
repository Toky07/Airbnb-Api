import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import { RESERVATION_STATUS } from '../../../domain/constants/reservation-status.constant';
import { Reservation } from '../../../domain/entities/reservation.entity';
import type { IReservationRepository } from '../../../domain/repositories/reservation.repository';
import { ReservationOutput } from '../../dto/reservation.output';
import type { ConfirmReservationCommand } from '../commands/ConfirmReservationCommand';

export class ConfirmReservationCommandHandler implements ICommandHandler<
  ConfirmReservationCommand,
  ReservationOutput
> {
  constructor(private readonly reservationRepository: IReservationRepository) {}

  async execute(
    command: ConfirmReservationCommand,
  ): Promise<ReservationOutput> {
    const reservation = await this.reservationRepository.findById(command.id);

    if (!reservation?.id) {
      throw new NotFoundException('Réservation introuvable.');
    }

    if (reservation.status === RESERVATION_STATUS.CANCELLED) {
      throw new BadRequestException(
        'Impossible de confirmer une réservation annulée.',
      );
    }

    const reservationUpdated = await this.reservationRepository.update(
      new Reservation(
        reservation.userId,
        reservation.items,
        RESERVATION_STATUS.CONFIRMED,
        reservation.paymentId,
        reservation.id,
        reservation.createdAt,
        reservation.updatedAt,
      ),
    );

    return ReservationOutput.fromDomain(reservationUpdated);
  }
}
