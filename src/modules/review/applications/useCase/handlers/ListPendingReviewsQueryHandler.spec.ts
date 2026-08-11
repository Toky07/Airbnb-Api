import { describe, expect, it, vi } from 'vitest';
import { REVIEW_STATUS } from '@src/modules/review/domain/constants/review-status.constant';
import { ListPendingReviewsQueryHandler } from './ListPendingReviewsQueryHandler';
import { ListPendingReviewsQuery } from '@src/modules/review/applications/useCase/queries/ListPendingReviewsQuery';
import { MapReviewOutputsService } from '@src/modules/review/applications/services/map-review-outputs.service';

describe('ListPendingReviewsQueryHandler', () => {
  it('lists pending reviews for moderation', async () => {
    const reviewRepository = {
      findPaginated: vi.fn().mockResolvedValue({
        data: [],
        meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
      }),
    };
    const mapReviewOutputsService = {
      mapPaginatedWithAuthors: vi.fn().mockResolvedValue({
        data: [],
        meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
      }),
    };

    const handler = new ListPendingReviewsQueryHandler(
      reviewRepository as never,
      mapReviewOutputsService as unknown as MapReviewOutputsService,
    );

    await handler.execute(new ListPendingReviewsQuery({ page: 1, limit: 20 }));

    expect(reviewRepository.findPaginated).toHaveBeenCalledWith(
      expect.objectContaining({ status: REVIEW_STATUS.PENDING }),
    );
  });
});
