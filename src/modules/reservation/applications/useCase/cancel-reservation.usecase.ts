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
import {
  RESERVATION_REPOSITORY,
  type IReservationRepository,
} from '../../domain/repositories/reservation.repository';
import { ReservationItemOutput } from '../dto/reservation-item.output';
import { EnrichReservationOutputsService } from '../services/enrich-reservation-outputs.service';
import { Reservation } from '../../domain/entities/reservation.entity';
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
  ) {}

  async execute(
    itemId: number,
    access: CancelReservationAccess,
  ): Promise<ReservationOutput> {
    const reservation = await this.reservationRepository.findById(itemId);

    if (!reservation) {
      throw new NotFoundException('Réservation introuvable.');
    }

    if (!reservation?.id) {
      throw new NotFoundException('Séjour introuvable.');
    }

    if (reservation.status === RESERVATION_STATUS.CANCELLED) {
      throw new BadRequestException('Ce séjour est déjà annulé.');
    }

    if (!access.canCancelAll) {
      const user = await this.userRepository.findByAuthId(access.authId);
      const isOwner = user?.id === reservation.userId;

      if (!isOwner && !access.canCancelHost) {
        throw new ForbiddenException('Accès refusé.');
      }
    }

    const updated = await this.reservationRepository.update(
      new Reservation(
        reservation.userId,
        reservation.items,
        RESERVATION_STATUS.CANCELLED,
        reservation.id,
      ),
    );

    return ReservationOutput.fromDomain(updated);
  }
}
