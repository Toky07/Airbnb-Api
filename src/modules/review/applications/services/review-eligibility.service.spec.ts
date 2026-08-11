import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { RESERVATION_STATUS } from '../../../reservation/domain/constants/reservation-status.constant';
import { Reservation } from '../../../reservation/domain/entities/reservation.entity';
import { ReservationItem } from '../../../reservation/domain/entities/reservation-item.entity';
import type { IReservationRepository } from '../../../reservation/domain/repositories/reservation.repository';
import type { IUserRepository } from '../../../user/contracts';
import type { IReviewRepository } from '../../domain/repositories/review.repository';
import { ReviewEligibilityService } from './review-eligibility.service';

describe('ReviewEligibilityService', () => {
  const pastCheckout = '2020-01-05';
  const futureCheckout = '2099-12-31';

  function createService(deps: {
    reservation?: Reservation | null;
    existingReview?: boolean;
    userId?: number;
  }) {
    const reservationRepository = {
      findById: async () => deps.reservation ?? null,
    } as unknown as IReservationRepository;

    const reviewRepository = {
      findByReservationId: async () => (deps.existingReview ? { id: 1 } : null),
    } as unknown as IReviewRepository;

    const userRepository = {
      findByAuthId: async () =>
        deps.userId ? { id: deps.userId, name: 'Traveler' } : null,
    } as unknown as IUserRepository;

    return new ReviewEligibilityService(
      reservationRepository,
      reviewRepository,
      userRepository,
    );
  }

  function buildReservation(
    userId: number,
    checkout: string,
    status = RESERVATION_STATUS.CONFIRMED,
  ) {
    return new Reservation(
      userId,
      [new ReservationItem(1, 5, '2020-01-01', checkout, 2, 10000, 4, 1)],
      status,
      1,
      1,
    );
  }

  it('allows review for eligible reservation', async () => {
    const service = createService({
      userId: 10,
      reservation: buildReservation(10, pastCheckout),
    });

    const result = await service.assertCanReview(1, 1);
    expect(result).toEqual({ userId: 10, roomId: 5 });
  });

  it('rejects when user is not owner', async () => {
    const service = createService({
      userId: 10,
      reservation: buildReservation(99, pastCheckout),
    });

    await expect(service.assertCanReview(1, 1)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('rejects when checkout has not passed', async () => {
    const service = createService({
      userId: 10,
      reservation: buildReservation(10, futureCheckout),
    });

    await expect(service.assertCanReview(1, 1)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects when reservation is not confirmed', async () => {
    const service = createService({
      userId: 10,
      reservation: buildReservation(
        10,
        pastCheckout,
        RESERVATION_STATUS.CANCELLED,
      ),
    });

    await expect(service.assertCanReview(1, 1)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects duplicate review', async () => {
    const service = createService({
      userId: 10,
      reservation: buildReservation(10, pastCheckout),
      existingReview: true,
    });

    await expect(service.assertCanReview(1, 1)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects when reservation not found', async () => {
    const service = createService({ userId: 10, reservation: null });

    await expect(service.assertCanReview(1, 1)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
