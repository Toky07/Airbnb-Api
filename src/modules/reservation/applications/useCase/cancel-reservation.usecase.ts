import {
  BadRequestException,
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
import { RESERVATION_STATUS } from '../../domain/constants/reservation-status.constant';
import { Reservation } from '../../domain/entities/reservation.entity';
import {
  RESERVATION_REPOSITORY,
  type IReservationRepository,
} from '../../domain/repositories/reservation.repository';
import { ReservationOutput } from '../dto/reservation.output';

export type CancelReservationAccess = {
  authId: number;
  canCancelAll: boolean;
  canCancelHost: boolean;
};

@Injectable()
export class CancelReservationUseCase {
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

  async execute(
    id: number,
    access: CancelReservationAccess,
  ): Promise<ReservationOutput> {
    const reservation = await this.reservationRepository.findById(id);

    if (!reservation?.id) {
      throw new NotFoundException('Réservation introuvable.');
    }

    if (reservation.status === RESERVATION_STATUS.CANCELLED) {
      throw new BadRequestException('Cette réservation est déjà annulée.');
    }

    if (!access.canCancelAll) {
      const user = await this.userRepository.findByAuthId(access.authId);
      const isOwner = user?.id === reservation.userId;
      const isHost =
        access.canCancelHost &&
        user?.id != null &&
        (await this.isHostOfReservation(user.id, reservation.roomId));

      if (!isOwner && !isHost) {
        throw new ForbiddenException('Accès refusé.');
      }
    }

    const updated = await this.reservationRepository.update(
      new Reservation(
        reservation.roomId,
        reservation.userId,
        reservation.startDate,
        reservation.endDate,
        reservation.guestCount,
        reservation.totalPrice,
        reservation.nights,
        RESERVATION_STATUS.CANCELLED,
        reservation.id,
        reservation.createdAt,
        reservation.updatedAt,
      ),
    );

    return ReservationOutput.fromDomain(updated);
  }

  private async isHostOfReservation(
    userId: number,
    roomId: number,
  ): Promise<boolean> {
    const properties = await this.propertyRepository.findAllByOwnerId(userId);
    const propertyIds = new Set(
      properties
        .map((property) => property.id)
        .filter((id): id is number => typeof id === 'number' && id > 0),
    );

    if (propertyIds.size === 0) {
      return false;
    }

    const room = await this.roomRepository.findById(roomId);
    return Boolean(room?.property?.id && propertyIds.has(room.property.id));
  }
}
