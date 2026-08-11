import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import type { IPropertyRepository } from '../../../properties/contracts';
import { PROPERTY_REPOSITORY } from '../../../properties/contracts';
import type { IRoomRepository } from '../../../rooms/contracts';
import { ROOM_REPOSITORY } from '../../../rooms/contracts';
import type { IUserRepository } from '../../../user/contracts';
import { USER_REPOSITORY } from '../../../user/contracts';
import type { Reservation } from '../../domain/entities/reservation.entity';
import {
  RESERVATION_REPOSITORY,
  type IReservationRepository,
} from '../../domain/repositories/reservation.repository';

export type ReservationAccess = {
  authId: number;
  canReadAll: boolean;
  canReadHost: boolean;
};

@Injectable()
export class AssertReservationAccessService {
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: IReservationRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
    @Inject(PROPERTY_REPOSITORY)
    private readonly propertyRepository: IPropertyRepository,
  ) {}

  async requireReservation(id: number): Promise<Reservation> {
    const reservation = await this.reservationRepository.findById(id);
    if (!reservation?.id) {
      throw new NotFoundException('Réservation introuvable.');
    }
    return reservation;
  }

  async assertCanManage(
    reservation: Reservation,
    access: ReservationAccess,
  ): Promise<void> {
    if (access.canReadAll) {
      return;
    }

    const user = await this.userRepository.findByAuthId(access.authId);
    if (user?.id === reservation.userId) {
      return;
    }

    if (access.canReadHost && user?.id) {
      const properties = await this.propertyRepository.findAllByOwnerId(
        user.id,
      );
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
    }

    throw new ForbiddenException('Accès refusé.');
  }
}
