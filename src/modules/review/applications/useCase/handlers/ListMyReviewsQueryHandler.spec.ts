import { NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { REVIEW_STATUS } from '../../../domain/constants/review-status.constant';
import { Review } from '../../../domain/entities/review.entity';
import { ListMyReviewsQueryHandler } from './ListMyReviewsQueryHandler';
import { ListMyReviewsQuery } from '../queries/ListMyReviewsQuery';
import { ResolveReviewUserService } from '../../services/resolve-review-user.service';

describe('ListMyReviewsQueryHandler', () => {
  it('returns paginated reviews for the authenticated user', async () => {
    const reviewRepository = {
      findPaginated: vi.fn().mockResolvedValue({
        data: [new Review(9, 1, 5, 4, 'Très bien', REVIEW_STATUS.PUBLISHED, 1)],
        meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
      }),
    };
    const resolveReviewUserService = {
      resolveUser: vi.fn().mockResolvedValue({ id: 9, name: 'Alice' }),
    };

    const handler = new ListMyReviewsQueryHandler(
      reviewRepository as never,
      resolveReviewUserService as unknown as ResolveReviewUserService,
    );

    const result = await handler.execute(
      new ListMyReviewsQuery(1, { page: 1, limit: 20 }),
    );

    expect(result.data).toHaveLength(1);
    expect(result.data[0]?.authorName).toBe('Alice');
  });

  it('throws when user is missing', async () => {
    const handler = new ListMyReviewsQueryHandler(
      {} as never,
      {
        resolveUser: vi.fn().mockRejectedValue(new NotFoundException()),
      } as unknown as ResolveReviewUserService,
    );

    await expect(
      handler.execute(new ListMyReviewsQuery(1, { page: 1, limit: 20 })),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
