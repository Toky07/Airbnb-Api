import type { IQueryHandler } from '@src/shared/useCase/bus/query-handler.interface';
import type { PaginatedResult } from '@src/shared/pagination/pagination.types';
import type { IReviewRepository } from '@src/modules/review/domain/repositories/review.repository';
import { ReviewOutput } from '@src/modules/review/applications/dto/review.output';
import type { ListMyReviewsQuery } from '@src/modules/review/applications/useCase/queries/ListMyReviewsQuery';
import { ResolveAuthenticatedUserService } from '@src/shared/auth/resolve-authenticated-user.service';

export class ListMyReviewsQueryHandler implements IQueryHandler<
  ListMyReviewsQuery,
  PaginatedResult<ReviewOutput>
> {
  constructor(
    private readonly reviewRepository: IReviewRepository,
    private readonly resolveAuthenticatedUserService: ResolveAuthenticatedUserService,
  ) {}

  async execute(
    query: ListMyReviewsQuery,
  ): Promise<PaginatedResult<ReviewOutput>> {
    const user = await this.resolveAuthenticatedUserService.resolveUser(
      query.authId,
      { failure: 'not-found' },
    );

    const result = await this.reviewRepository.findPaginated({
      page: query.pagination.page,
      limit: query.pagination.limit,
      userId: user.id,
    });

    return {
      data: result.data.map((review) =>
        ReviewOutput.fromDomain(review, user.name),
      ),
      meta: result.meta,
    };
  }
}
