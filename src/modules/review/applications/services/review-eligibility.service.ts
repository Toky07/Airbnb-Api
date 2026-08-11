import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { RESERVATION_STATUS } from '../../../reservation/contracts';
import type { IReservationByIdReader } from '../../../reservation/contracts';
import type { IUserRepository } from '../../../user/contracts';
import type { IReviewRepository } from '../../domain/repositories/review.repository';

export class ReviewEligibilityService {
  constructor(
    private readonly reservationRepository: IReservationByIdReader,
    private readonly reviewRepository: IReviewRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async assertCanReview(
    authId: number,
    reservationId: number,
  ): Promise<{
    userId: number;
    roomId: number;
  }> {
    const user = await this.userRepository.findByAuthId(authId);
    if (!user?.id) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    const reservation =
      await this.reservationRepository.findById(reservationId);
    if (!reservation) {
      throw new NotFoundException('Réservation introuvable.');
    }

    if (reservation.userId !== user.id) {
      throw new ForbiddenException(
        'Seul le voyageur ayant effectué la réservation peut laisser un avis.',
      );
    }

    if (reservation.status !== RESERVATION_STATUS.CONFIRMED) {
      throw new BadRequestException(
        'Seules les réservations confirmées peuvent être évaluées.',
      );
    }

    const checkoutDate = this.getCheckoutDate(reservation);
    const today = new Date().toISOString().slice(0, 10);
    if (checkoutDate >= today) {
      throw new BadRequestException(
        'Vous pourrez laisser un avis après la fin de votre séjour.',
      );
    }

    const existing =
      await this.reviewRepository.findByReservationId(reservationId);
    if (existing) {
      throw new BadRequestException(
        'Un avis a déjà été laissé pour cette réservation.',
      );
    }

    const roomId = reservation.items[0]?.roomId;
    if (!roomId) {
      throw new BadRequestException('Réservation invalide.');
    }

    return { userId: user.id, roomId };
  }

  private getCheckoutDate(reservation: {
    items: { checkOut: string }[];
  }): string {
    return reservation.items.reduce(
      (latest, item) => (item.checkOut > latest ? item.checkOut : latest),
      reservation.items[0]?.checkOut ?? '',
    );
  }
}
