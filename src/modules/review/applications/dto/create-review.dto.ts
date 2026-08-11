import {
  IsIn,
  IsInt,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import {
  REVIEW_RATING_MAX,
  REVIEW_RATING_MIN,
  REVIEW_STATUS,
} from '@src/modules/review/domain/constants/review-status.constant';

export class CreateReviewDto {
  @IsInt()
  @Min(1)
  reservationId: number;

  @IsInt()
  @Min(REVIEW_RATING_MIN)
  @Max(REVIEW_RATING_MAX)
  rating: number;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  comment: string;
}

export class ModerateReviewDto {
  @IsIn([REVIEW_STATUS.PUBLISHED, REVIEW_STATUS.HIDDEN])
  status: 'published' | 'hidden';
}

export function isValidRating(rating: number): boolean {
  return (
    Number.isInteger(rating) &&
    rating >= REVIEW_RATING_MIN &&
    rating <= REVIEW_RATING_MAX
  );
}
