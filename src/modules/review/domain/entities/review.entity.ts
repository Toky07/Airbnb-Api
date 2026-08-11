import type { ReviewStatus } from '@src/modules/review/domain/constants/review-status.constant';

export class Review {
  constructor(
    public readonly userId: number,
    public readonly reservationId: number,
    public readonly roomId: number,
    public readonly rating: number,
    public readonly comment: string,
    public readonly status: ReviewStatus,
    public readonly id?: number,
    public readonly createdAt?: Date,
  ) {}
}
