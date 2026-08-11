import { BadRequestException } from '@nestjs/common';
import { REVIEW_STATUS } from '@src/modules/review/domain/constants/review-status.constant';
import { Review } from '@src/modules/review/domain/entities/review.entity';
import type { IReviewRepository } from '@src/modules/review/domain/repositories/review.repository';
import type { ReviewEligibilityService } from '@src/modules/review/applications/services/review-eligibility.service';
import { CreateReviewCommand } from '@src/modules/review/applications/useCase/commands/CreateReviewCommand';
import { CreateReviewCommandHandler } from './CreateReviewCommandHandler';

describe('CreateReviewCommandHandler', () => {
  it('creates a pending review', async () => {
    const reviewRepository = {
      create: async (review: Review) =>
        new Review(
          review.userId,
          review.reservationId,
          review.roomId,
          review.rating,
          review.comment,
          review.status,
          1,
          new Date(),
        ),
    } as unknown as IReviewRepository;

    const reviewEligibilityService = {
      assertCanReview: async () => ({ userId: 10, roomId: 5 }),
    } as unknown as ReviewEligibilityService;

    const handler = new CreateReviewCommandHandler(
      reviewRepository,
      reviewEligibilityService,
    );

    const result = await handler.execute(
      new CreateReviewCommand(1, {
        reservationId: 42,
        rating: 5,
        comment: 'Excellent séjour',
      }),
    );

    expect(result.rating).toBe(5);
    expect(result.status).toBe(REVIEW_STATUS.PENDING);
  });

  it('rejects invalid rating', async () => {
    const handler = new CreateReviewCommandHandler(
      {} as IReviewRepository,
      {} as ReviewEligibilityService,
    );

    await expect(
      handler.execute(
        new CreateReviewCommand(1, {
          reservationId: 42,
          rating: 6,
          comment: 'Too high',
        }),
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects empty comment', async () => {
    const reviewEligibilityService = {
      assertCanReview: async () => ({ userId: 10, roomId: 5 }),
    } as unknown as ReviewEligibilityService;

    const handler = new CreateReviewCommandHandler(
      {} as IReviewRepository,
      reviewEligibilityService,
    );

    await expect(
      handler.execute(
        new CreateReviewCommand(1, {
          reservationId: 42,
          rating: 4,
          comment: '   ',
        }),
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
