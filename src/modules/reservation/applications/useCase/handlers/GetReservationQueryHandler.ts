import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import type { IPropertyRepository } from '../../../../properties/domain/repositories/property.repository';
import type { IRoomRepository } from '../../../../rooms/domain/repositories/room.repository';
import type { IUserRepository } from '../../../../user/domain/repositories/user.repository';
import type { Reservation } from '../../../domain/entities/reservation.entity';
import type { IReservationRepository } from '../../../domain/repositories/reservation.repository';
import { ReservationOutput } from '../../dto/reservation.output';
import type { EnrichReservationOutputsService } from '../../services/enrich-reservation-outputs.service';
import type { GetReservationQuery } from '../queries/GetReservationQuery';

export class GetReservationQueryHandler implements IQueryHandler<
  GetReservationQuery,
  ReservationOutput
> {
  constructor(
    private readonly reservationRepository: IReservationRepository,
    private readonly userRepository: IUserRepository,
    private readonly roomRepository: IRoomRepository,
    private readonly propertyRepository: IPropertyRepository,
    private readonly enrichReservationOutputs: EnrichReservationOutputsService,
  ) {}

  async execute(query: GetReservationQuery): Promise<ReservationOutput> {
    const reservation = await this.reservationRepository.findById(query.id);

    if (!reservation?.id) {
      throw new NotFoundException('Réservation introuvable.');
    }

    if (query.access.canReadAll) {
      return this.toEnrichedOutput(reservation);
    }

    const user = await this.userRepository.findByAuthId(query.access.authId);
    if (user?.id === reservation.userId) {
      return this.toEnrichedOutput(reservation);
    }

    if (query.access.canReadHost && user?.id) {
      const properties = await this.propertyRepository.findAllByOwnerId(
        user.id,
      );
      const propertyIds = new Set(
        properties
          .map((property) => property.id)
          .filter((id): id is number => typeof id === 'number' && id > 0),
      );

      if (propertyIds.size > 0) {
        for (const item of reservation.items) {
          const room = await this.roomRepository.findById(item.roomId);
          if (room?.property?.id && propertyIds.has(room.property.id)) {
            return this.toEnrichedOutput(reservation);
          }
        }
      }
    }

    throw new ForbiddenException('Accès refusé.');
  }

  private async toEnrichedOutput(
    reservation: Reservation,
  ): Promise<ReservationOutput> {
    const [output] = await this.enrichReservationOutputs.enrich([
      ReservationOutput.fromDomain(reservation),
    ]);
    return output ?? ReservationOutput.fromDomain(reservation);
  }
}
