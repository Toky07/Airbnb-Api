import {
  BadRequestException,
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
import type { IReservationByIdReader } from '../../../reservation/contracts';
import { RESERVATION_REPOSITORY } from '../../../reservation/contracts';

export type ReservationParticipants = {
  guestId: number;
  hostId: number;
};

@Injectable()
export class ResolveReservationParticipantsService {
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: IReservationByIdReader,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
    @Inject(PROPERTY_REPOSITORY)
    private readonly propertyRepository: IPropertyRepository,
  ) {}

  async resolveFromReservationId(
    reservationId: number,
  ): Promise<ReservationParticipants> {
    const reservation =
      await this.reservationRepository.findById(reservationId);
    if (!reservation?.id) {
      throw new NotFoundException('Réservation introuvable.');
    }

    const firstItem = reservation.items[0];
    if (!firstItem) {
      throw new BadRequestException('Réservation invalide.');
    }

    const room = await this.roomRepository.findById(firstItem.roomId);
    const propertyId = room?.property?.id;
    if (!propertyId) {
      throw new BadRequestException('Chambre ou établissement introuvable.');
    }

    const property = await this.propertyRepository.findById(propertyId);
    if (!property?.ownerId) {
      throw new BadRequestException('Hôte introuvable.');
    }

    return {
      guestId: reservation.userId,
      hostId: property.ownerId,
    };
  }

  async assertParticipant(
    reservationId: number,
    authId: number,
  ): Promise<{ userId: number; participants: ReservationParticipants }> {
    const user = await this.userRepository.findByAuthId(authId);
    if (!user?.id) {
      throw new ForbiddenException('Accès refusé.');
    }

    const participants = await this.resolveFromReservationId(reservationId);
    if (user.id !== participants.guestId && user.id !== participants.hostId) {
      throw new ForbiddenException('Accès refusé.');
    }

    return { userId: user.id, participants };
  }
}
