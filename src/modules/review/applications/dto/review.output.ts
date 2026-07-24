import type { ReviewStatus } from '../../domain/constants/review-status.constant';
import type { Review } from '../../domain/entities/review.entity';

export class ReviewOutput {
  constructor(
    public readonly id: number,
    public readonly userId: number,
    public readonly reservationId: number,
    public readonly roomId: number,
    public readonly rating: number,
    public readonly comment: string,
    public readonly status: ReviewStatus,
    public readonly createdAt: Date,
    public readonly authorName?: string,
  ) {}

  static fromDomain(review: Review, authorName?: string): ReviewOutput {
    return new ReviewOutput(
      review.id!,
      review.userId,
      review.reservationId,
      review.roomId,
      review.rating,
      review.comment,
      review.status,
      review.createdAt!,
      authorName,
    );
  }
}
