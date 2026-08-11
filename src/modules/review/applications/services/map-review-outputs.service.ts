import type { PaginatedResult } from '@src/shared/pagination/pagination.types';
import type { IUserRepository } from '@src/modules/user/contracts';
import type { Review } from '@src/modules/review/domain/entities/review.entity';
import { ReviewOutput } from '@src/modules/review/applications/dto/review.output';

export class MapReviewOutputsService {
  constructor(private readonly userRepository: IUserRepository) {}

  async mapPaginatedWithAuthors(
    result: PaginatedResult<Review>,
  ): Promise<PaginatedResult<ReviewOutput>> {
    const data = await Promise.all(
      result.data.map(async (review) => {
        const author = await this.userRepository.findById(review.userId);
        return ReviewOutput.fromDomain(review, author?.name);
      }),
    );

    return { data, meta: result.meta };
  }
}
