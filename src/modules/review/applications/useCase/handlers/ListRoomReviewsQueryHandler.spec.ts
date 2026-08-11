import { NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { REVIEW_STATUS } from '@src/modules/review/domain/constants/review-status.constant';
import { Review } from '@src/modules/review/domain/entities/review.entity';
import { ListRoomReviewsQueryHandler } from './ListRoomReviewsQueryHandler';
import { ListRoomReviewsQuery } from '@src/modules/review/applications/useCase/queries/ListRoomReviewsQuery';
import { MapReviewOutputsService } from '@src/modules/review/applications/services/map-review-outputs.service';

describe('ListRoomReviewsQueryHandler', () => {
  it('lists published reviews for a room slug', async () => {
    const reviewRepository = {
      findPaginated: vi.fn().mockResolvedValue({
        data: [new Review(2, 1, 5, 5, 'Parfait', REVIEW_STATUS.PUBLISHED, 1)],
        meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
      }),
    };
    const roomRepository = {
      findBySlug: vi.fn().mockResolvedValue({ id: 5, slug: 'suite' }),
    };
    const mapReviewOutputsService = {
      mapPaginatedWithAuthors: vi.fn().mockResolvedValue({
        data: [{ id: 1, rating: 5 }],
        meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
      }),
    };

    const handler = new ListRoomReviewsQueryHandler(
      reviewRepository as never,
      roomRepository as never,
      mapReviewOutputsService as unknown as MapReviewOutputsService,
    );

    const result = await handler.execute(
      new ListRoomReviewsQuery('suite', { page: 1, limit: 20 }),
    );

    expect(result.data).toHaveLength(1);
    expect(reviewRepository.findPaginated).toHaveBeenCalledWith(
      expect.objectContaining({ roomId: 5, status: REVIEW_STATUS.PUBLISHED }),
    );
  });

  it('throws when room slug is unknown', async () => {
    const handler = new ListRoomReviewsQueryHandler(
      {} as never,
      { findBySlug: vi.fn().mockResolvedValue(null) } as never,
      {} as never,
    );

    await expect(
      handler.execute(
        new ListRoomReviewsQuery('missing', { page: 1, limit: 20 }),
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
