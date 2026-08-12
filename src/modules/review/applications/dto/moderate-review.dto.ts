import { IsIn } from 'class-validator';
import { REVIEW_STATUS } from '@src/modules/review/domain/constants/review-status.constant';

export class ModerateReviewDto {
  @IsIn([REVIEW_STATUS.PUBLISHED, REVIEW_STATUS.HIDDEN])
  status: 'published' | 'hidden';
}
