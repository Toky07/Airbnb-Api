import {
  REVIEW_RATING_MAX,
  REVIEW_RATING_MIN,
} from '@src/modules/review/domain/constants/review-status.constant';

export function isValidRating(rating: number): boolean {
  return (
    Number.isInteger(rating) &&
    rating >= REVIEW_RATING_MIN &&
    rating <= REVIEW_RATING_MAX
  );
}
