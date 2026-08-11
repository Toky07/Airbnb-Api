import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import type { IPropertyRepository } from '@src/modules/properties/contracts';
import type { IRoomRepository } from '@src/modules/rooms/contracts';
import type { IUserRepository } from '@src/modules/user/contracts';
import { RESERVATION_STATUS } from '@src/modules/reservation/domain/constants/reservation-status.constant';
import { Reservation } from '@src/modules/reservation/domain/entities/reservation.entity';
import type { IReservationRepository } from '@src/modules/reservation/domain/repositories/reservation.repository';
import { ReservationOutput } from '@src/modules/reservation/applications/dto/reservation.output';
import type { EnrichReservationOutputsService } from '@src/modules/reservation/applications/services/enrich-reservation-outputs.service';
import type { MarkReservationNoShowCommand } from '@src/modules/reservation/applications/useCase/commands/MarkReservationNoShowCommand';

export class MarkReservationNoShowCommandHandler implements ICommandHandler<
  MarkReservationNoShowCommand,
  ReservationOutput
> {
  constructor(
    private readonly reservationRepository: IReservationRepository,
    private readonly userRepository: IUserRepository,
    private readonly roomRepository: IRoomRepository,
    private readonly propertyRepository: IPropertyRepository,
    private readonly enrichReservationOutputs: EnrichReservationOutputsService,
  ) {}

  async execute(
    command: MarkReservationNoShowCommand,
  ): Promise<ReservationOutput> {
    const reservation = await this.reservationRepository.findById(command.id);

    if (!reservation?.id) {
      throw new NotFoundException('Réservation introuvable.');
    }

    if (reservation.status !== RESERVATION_STATUS.CONFIRMED) {
      throw new BadRequestException(
        'Seule une réservation confirmée peut être marquée no-show.',
      );
    }

    await this.assertHostScope(reservation, command.authId);

    const checkIn = reservation.items[0]?.checkIn;
    if (!checkIn) {
      throw new BadRequestException('Séjour invalide.');
    }

    const today = new Date().toISOString().slice(0, 10);
    if (checkIn > today) {
      throw new BadRequestException(
        'Le no-show ne peut être marqué qu’à partir du jour d’arrivée.',
      );
    }

    const updated = await this.reservationRepository.update(
      new Reservation(
        reservation.userId,
        reservation.items,
        RESERVATION_STATUS.NO_SHOW,
        reservation.paymentId,
        reservation.id,
        reservation.createdAt,
        reservation.updatedAt,
        null,
      ),
    );

    const [output] = await this.enrichReservationOutputs.enrich([
      ReservationOutput.fromDomain(updated),
    ]);
    return output ?? ReservationOutput.fromDomain(updated);
  }

  private async assertHostScope(
    reservation: Reservation,
    authId: number,
  ): Promise<void> {
    const user = await this.userRepository.findByAuthId(authId);
    if (!user?.id) {
      throw new ForbiddenException('Accès refusé.');
    }

    const properties = await this.propertyRepository.findAllByOwnerId(user.id);
    const propertyIds = new Set(
      properties
        .map((property) => property.id)
        .filter((id): id is number => typeof id === 'number' && id > 0),
    );

    for (const item of reservation.items) {
      const room = await this.roomRepository.findById(item.roomId);
      if (room?.property?.id && propertyIds.has(room.property.id)) {
        return;
      }
    }

    throw new ForbiddenException('Accès refusé.');
  }
}
