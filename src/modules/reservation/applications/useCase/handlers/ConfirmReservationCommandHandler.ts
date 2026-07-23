import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import { RESERVATION_STATUS } from '../../../domain/constants/reservation-status.constant';
import { Reservation } from '../../../domain/entities/reservation.entity';
import type { IReservationRepository } from '../../../domain/repositories/reservation.repository';
import { ReservationOutput } from '../../dto/reservation.output';
import type { CheckRoomAvailabilityService } from '../../services/check-room-availability.service';
import type { ConfirmReservationCommand } from '../commands/ConfirmReservationCommand';

export class ConfirmReservationCommandHandler implements ICommandHandler<
  ConfirmReservationCommand,
  ReservationOutput
> {
  constructor(
    private readonly reservationRepository: IReservationRepository,
    private readonly checkRoomAvailability: CheckRoomAvailabilityService,
  ) {}

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

    if (reservation.status === RESERVATION_STATUS.CONFIRMED) {
      return ReservationOutput.fromDomain(reservation);
    }

    if (reservation.holdUntil && reservation.holdUntil.getTime() < Date.now()) {
      await this.cancelReservation(reservation);
      throw new BadRequestException(
        'Le délai de réservation a expiré. Veuillez recommencer le paiement.',
      );
    }

    try {
      for (const item of reservation.items) {
        await this.checkRoomAvailability.ensureAvailable(
          item.roomId,
          item.checkIn,
          item.checkOut,
          reservation.id,
        );
      }
    } catch (error) {
      await this.cancelReservation(reservation);
      throw error;
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
        null,
      ),
    );

    return ReservationOutput.fromDomain(reservationUpdated);
  }

  private async cancelReservation(reservation: Reservation): Promise<void> {
    await this.reservationRepository.update(
      new Reservation(
        reservation.userId,
        reservation.items,
        RESERVATION_STATUS.CANCELLED,
        reservation.paymentId,
        reservation.id,
        reservation.createdAt,
        reservation.updatedAt,
        null,
      ),
    );
  }
}
