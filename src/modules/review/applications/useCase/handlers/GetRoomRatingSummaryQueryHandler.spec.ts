import { NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { GetRoomRatingSummaryQueryHandler } from './GetRoomRatingSummaryQueryHandler';
import { GetRoomRatingSummaryQuery } from '../queries/GetRoomRatingSummaryQuery';

describe('GetRoomRatingSummaryQueryHandler', () => {
  it('returns rating summary for a room slug', async () => {
    const reviewRepository = {
      getRoomRatingSummary: vi.fn().mockResolvedValue({
        averageRating: 4.5,
        totalReviews: 12,
        distribution: { 5: 8, 4: 4 },
      }),
    };
    const roomRepository = {
      findBySlug: vi.fn().mockResolvedValue({ id: 3, slug: 'suite' }),
    };

    const handler = new GetRoomRatingSummaryQueryHandler(
      reviewRepository as never,
      roomRepository as never,
    );

    const result = await handler.execute(new GetRoomRatingSummaryQuery('suite'));

    expect(result.averageRating).toBe(4.5);
    expect(result.totalReviews).toBe(12);
  });

  it('throws when room slug is unknown', async () => {
    const handler = new GetRoomRatingSummaryQueryHandler(
      {} as never,
      { findBySlug: vi.fn().mockResolvedValue(null) } as never,
    );

    await expect(
      handler.execute(new GetRoomRatingSummaryQuery('missing')),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
