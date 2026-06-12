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
import { ReservationItem } from '../../domain/entities/reservation-item.entity';
import {
  RESERVATION_REPOSITORY,
  type IReservationRepository,
} from '../../domain/repositories/reservation.repository';
import { ReservationItemOutput } from '../dto/reservation-item.output';
import { EnrichReservationOutputsService } from '../services/enrich-reservation-outputs.service';

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
    private readonly enrichReservationOutputs: EnrichReservationOutputsService,
  ) {}

  async execute(
    itemId: number,
    access: CancelReservationAccess,
  ): Promise<ReservationItemOutput> {
    const item = await this.reservationRepository.findItemById(itemId);

    if (!item?.id) {
      throw new NotFoundException('Séjour introuvable.');
    }

    if (item.status === RESERVATION_STATUS.CANCELLED) {
      throw new BadRequestException('Ce séjour est déjà annulé.');
    }

    const reservation = await this.reservationRepository.findById(item.reservationId);
    if (!reservation) {
      throw new NotFoundException('Réservation introuvable.');
    }

    if (!access.canCancelAll) {
      const user = await this.userRepository.findByAuthId(access.authId);
      const isOwner = user?.id === reservation.userId;
      const isHost =
        access.canCancelHost &&
        user?.id != null &&
        (await this.isHostOfReservation(user.id, item.roomId));

      if (!isOwner && !isHost) {
        throw new ForbiddenException('Accès refusé.');
      }
    }

    const updated = await this.reservationRepository.updateItem(
      new ReservationItem(
        item.reservationId,
        item.roomId,
        item.checkIn,
        item.checkOut,
        item.guestCount,
        item.price,
        item.nights,
        RESERVATION_STATUS.CANCELLED,
        item.id,
        item.createdAt,
        item.updatedAt,
      ),
    );

    const [enriched] = await this.enrichReservationOutputs.enrichItems([
      ReservationItemOutput.fromDomain(updated),
    ]);

    return enriched ?? ReservationItemOutput.fromDomain(updated);
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
