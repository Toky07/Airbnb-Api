import type { RoomRatingSummary } from '@src/modules/review/domain/repositories/review.repository';

export class RoomRatingSummaryOutput {
  constructor(
    public readonly averageRating: number,
    public readonly totalReviews: number,
    public readonly distribution: Record<number, number>,
  ) {}

  static fromSummary(summary: RoomRatingSummary): RoomRatingSummaryOutput {
    return new RoomRatingSummaryOutput(
      summary.averageRating,
      summary.totalReviews,
      summary.distribution,
    );
  }
}
