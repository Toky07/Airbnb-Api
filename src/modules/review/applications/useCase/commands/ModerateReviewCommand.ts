import type { ModerateReviewDto } from '../../dto/create-review.dto';

export class ModerateReviewCommand {
  constructor(
    public readonly reviewId: number,
    public readonly dto: ModerateReviewDto,
  ) {}
}
