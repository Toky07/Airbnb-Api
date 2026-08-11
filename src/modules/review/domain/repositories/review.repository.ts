import type {
  PaginatedResult,
  PaginationParams,
} from '@src/shared/pagination/pagination.types';
import type { ReviewStatus } from '@src/modules/review/domain/constants/review-status.constant';
import type { Review } from '@src/modules/review/domain/entities/review.entity';

export const REVIEW_REPOSITORY = 'REVIEW_REPOSITORY';

export type ReviewListParams = PaginationParams & {
  roomId?: number;
  userId?: number;
  status?: ReviewStatus;
};

export type RoomRatingSummary = {
  averageRating: number;
  totalReviews: number;
  distribution: Record<number, number>;
};

export interface IReviewRepository {
  create(review: Review): Promise<Review>;
  update(review: Review): Promise<Review>;
  findById(id: number): Promise<Review | null>;
  findByReservationId(reservationId: number): Promise<Review | null>;
  findPaginated(params: ReviewListParams): Promise<PaginatedResult<Review>>;
  getRoomRatingSummary(roomId: number): Promise<RoomRatingSummary>;
}
