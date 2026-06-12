import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  PROPERTY_REPOSITORY,
} from '../../../properties/infrastructure/repositories/property.repository';
import type { IPropertyRepository } from '../../../properties/domain/repositories/property.repository';
import {
  ROOM_REPOSITORY,
  type IRoomRepository,
} from '../../../rooms/domain/repositories/room.repository';
import { USER_REPOSITORY } from '../../../user/infrastructure/repositories/user.repository';
import type { IUserRepository } from '../../../user/domain/repositories/user.repository';
import {
  RESERVATION_REPOSITORY,
  type IReservationRepository,
} from '../../domain/repositories/reservation.repository';
import { ReservationOutput } from '../dto/reservation.output';
import { EnrichReservationOutputsService } from '../services/enrich-reservation-outputs.service';

export type GetReservationAccess = {
  authId: number;
  canReadAll: boolean;
  canReadHost: boolean;
};

@Injectable()
export class GetReservationUseCase {
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: IReservationRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
    @Inject(PROPERTY_REPOSITORY)
    private readonly propertyRepository: IPropertyRepository,
    private readonly enrichReservationOutputs: EnrichReservationOutputsService,
  ) {}

  async execute(
    id: number,
    access: GetReservationAccess,
  ): Promise<ReservationOutput> {
    const reservation = await this.reservationRepository.findById(id);

    if (!reservation?.id) {
      throw new NotFoundException('Réservation introuvable.');
    }

    if (access.canReadAll) {
      return this.toEnrichedOutput(reservation);
    }

    const user = await this.userRepository.findByAuthId(access.authId);
    if (user?.id === reservation.userId) {
      return this.toEnrichedOutput(reservation);
    }

    if (access.canReadHost && user?.id) {
      const properties = await this.propertyRepository.findAllByOwnerId(user.id);
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
    reservation: import('../../domain/entities/reservation.entity').Reservation,
  ): Promise<ReservationOutput> {
    const [output] = await this.enrichReservationOutputs.enrich([
      ReservationOutput.fromDomain(reservation),
    ]);
    return output ?? ReservationOutput.fromDomain(reservation);
  }
}
