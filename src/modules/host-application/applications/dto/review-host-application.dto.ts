import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import {
  HOST_APPLICATION_REVIEW_COMMENT_MAX_LENGTH,
  HOST_APPLICATION_STATUS,
  type HostApplicationReviewStatus,
} from '@src/modules/host-application/domain/constants/host-application-status.constant';

export class ReviewHostApplicationDto {
  @IsIn([HOST_APPLICATION_STATUS.APPROVED, HOST_APPLICATION_STATUS.REJECTED])
  status: HostApplicationReviewStatus;

  @IsOptional()
  @IsString()
  @MaxLength(HOST_APPLICATION_REVIEW_COMMENT_MAX_LENGTH)
  comment?: string;
}
