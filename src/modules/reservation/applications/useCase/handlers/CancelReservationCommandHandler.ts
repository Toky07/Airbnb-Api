import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import type { IUserRepository } from '../../../../user/domain/repositories/user.repository';
import type { IPaymentRepository } from '../../../../payment/domain/repositories/payment.repository';
import { RESERVATION_STATUS } from '../../../domain/constants/reservation-status.constant';
import { Reservation } from '../../../domain/entities/reservation.entity';
import type { IReservationRepository } from '../../../domain/repositories/reservation.repository';
import { ReservationOutput } from '../../dto/reservation.output';
import type { CancelReservationCommand } from '../commands/CancelReservationCommand';

export class CancelReservationCommandHandler
  implements ICommandHandler<CancelReservationCommand, ReservationOutput>
{
  constructor(
    private readonly reservationRepository: IReservationRepository,
    private readonly userRepository: IUserRepository,
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  async execute(command: CancelReservationCommand): Promise<ReservationOutput> {
    const reservation = await this.reservationRepository.findById(command.id);

    if (!reservation) {
      throw new NotFoundException('Réservation introuvable.');
    }

    if (!reservation?.id) {
      throw new NotFoundException('Séjour introuvable.');
    }

    const payment = await this.paymentRepository.findById(reservation.paymentId ?? 0);

    if (!payment) {
      throw new NotFoundException('Paiement introuvable.');
    }

    if (reservation.status === RESERVATION_STATUS.CANCELLED) {
      throw new BadRequestException('Ce séjour est déjà annulé.');
    }

    if (!command.access.canCancelAll) {
      const user = await this.userRepository.findByAuthId(command.access.authId);
      const isOwner = user?.id === reservation.userId;

      if (!isOwner && !command.access.canCancelHost) {
        throw new ForbiddenException('Accès refusé.');
      }
    }

    const updated = await this.reservationRepository.update(
      new Reservation(
        reservation.userId,
        reservation.items,
        RESERVATION_STATUS.CANCELLED,
        payment.id,
        reservation.id,
      ),
    );

    return ReservationOutput.fromDomain(updated);
  }
}
