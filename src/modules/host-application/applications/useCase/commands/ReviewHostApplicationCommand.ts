import type { ReviewHostApplicationDto } from '@src/modules/host-application/applications/dto/review-host-application.dto';

export class ReviewHostApplicationCommand {
  constructor(
    public readonly applicationId: number,
    public readonly reviewerAuthId: number,
    public readonly dto: ReviewHostApplicationDto,
  ) {}
}
