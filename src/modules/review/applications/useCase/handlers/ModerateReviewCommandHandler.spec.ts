import { BadRequestException, NotFoundException } from '@nestjs/common';
import { REVIEW_STATUS } from '../../../domain/constants/review-status.constant';
import { Review } from '../../../domain/entities/review.entity';
import type { IReviewRepository } from '../../../domain/repositories/review.repository';
import type { IUserRepository } from '../../../../user/domain/repositories/user.repository';
import { ModerateReviewCommand } from '../commands/ModerateReviewCommand';
import { ModerateReviewCommandHandler } from './ModerateReviewCommandHandler';

describe('ModerateReviewCommandHandler', () => {
  const pendingReview = new Review(
    10,
    42,
    5,
    4,
    'Bon séjour',
    REVIEW_STATUS.PENDING,
    1,
    new Date(),
  );

  it('publishes a pending review', async () => {
    const reviewRepository = {
      findById: async () => pendingReview,
      update: async (review: Review) => review,
    } as unknown as IReviewRepository;

    const userRepository = {
      findById: async () => ({ name: 'Jean Dupont' }),
    } as unknown as IUserRepository;

    const handler = new ModerateReviewCommandHandler(
      reviewRepository,
      userRepository,
    );

    const result = await handler.execute(
      new ModerateReviewCommand(1, { status: 'published' }),
    );

    expect(result.status).toBe(REVIEW_STATUS.PUBLISHED);
    expect(result.authorName).toBe('Jean Dupont');
  });

  it('rejects moderation when review not found', async () => {
    const reviewRepository = {
      findById: async () => null,
    } as unknown as IReviewRepository;

    const handler = new ModerateReviewCommandHandler(
      reviewRepository,
      {} as IUserRepository,
    );

    await expect(
      handler.execute(new ModerateReviewCommand(99, { status: 'published' })),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects moderation of already published review', async () => {
    const reviewRepository = {
      findById: async () =>
        new Review(
          10,
          42,
          5,
          4,
          'Bon séjour',
          REVIEW_STATUS.PUBLISHED,
          1,
          new Date(),
        ),
    } as unknown as IReviewRepository;

    const handler = new ModerateReviewCommandHandler(
      reviewRepository,
      {} as IUserRepository,
    );

    await expect(
      handler.execute(new ModerateReviewCommand(1, { status: 'hidden' })),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
