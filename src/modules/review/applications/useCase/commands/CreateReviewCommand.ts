import type { CreateReviewDto } from '@src/modules/review/applications/dto/create-review.dto';

export class CreateReviewCommand {
  constructor(
    public readonly authId: number,
    public readonly dto: CreateReviewDto,
  ) {}
}
