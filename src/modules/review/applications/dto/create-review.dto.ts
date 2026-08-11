import {
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
