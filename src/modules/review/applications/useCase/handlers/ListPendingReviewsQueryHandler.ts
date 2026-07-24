import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import type { PaginatedResult } from '../../../../../shared/pagination/pagination.types';
import { REVIEW_STATUS } from '../../../domain/constants/review-status.constant';
import type { IReviewRepository } from '../../../domain/repositories/review.repository';
import type { IUserRepository } from '../../../../user/domain/repositories/user.repository';
import { ReviewOutput } from '../../dto/review.output';
import type { ListPendingReviewsQuery } from '../queries/ListPendingReviewsQuery';

export class ListPendingReviewsQueryHandler implements IQueryHandler<
  ListPendingReviewsQuery,
  PaginatedResult<ReviewOutput>
> {
  constructor(
    private readonly reviewRepository: IReviewRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    query: ListPendingReviewsQuery,
  ): Promise<PaginatedResult<ReviewOutput>> {
    const result = await this.reviewRepository.findPaginated({
      page: query.pagination.page,
      limit: query.pagination.limit,
      status: REVIEW_STATUS.PENDING,
    });

    const data = await Promise.all(
      result.data.map(async (review) => {
        const author = await this.userRepository.findById(review.userId);
        return ReviewOutput.fromDomain(review, author?.name);
      }),
    );

    return { data, meta: result.meta };
  }
}
