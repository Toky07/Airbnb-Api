import type { ModerateReviewDto } from '@src/modules/review/applications/dto/create-review.dto';

export class ModerateReviewCommand {
  constructor(
    public readonly reviewId: number,
    public readonly dto: ModerateReviewDto,
  ) {}
}
