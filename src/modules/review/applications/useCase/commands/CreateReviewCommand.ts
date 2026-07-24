import type { CreateReviewDto } from '../../dto/create-review.dto';

export class CreateReviewCommand {
  constructor(
    public readonly authId: number,
    public readonly dto: CreateReviewDto,
  ) {}
}
