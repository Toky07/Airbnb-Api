import type { IQueryHandler } from '@src/shared/useCase/bus/query-handler.interface';
import type { PaginatedResult } from '@src/shared/pagination/pagination.types';
import { REVIEW_STATUS } from '@src/modules/review/domain/constants/review-status.constant';
import type { IReviewRepository } from '@src/modules/review/domain/repositories/review.repository';
import { ReviewOutput } from '@src/modules/review/applications/dto/review.output';
import type { ListPendingReviewsQuery } from '@src/modules/review/applications/useCase/queries/ListPendingReviewsQuery';
import { MapReviewOutputsService } from '@src/modules/review/applications/services/map-review-outputs.service';

export class ListPendingReviewsQueryHandler implements IQueryHandler<
  ListPendingReviewsQuery,
  PaginatedResult<ReviewOutput>
> {
  constructor(
    private readonly reviewRepository: IReviewRepository,
    private readonly mapReviewOutputsService: MapReviewOutputsService,
  ) {}

  async execute(
    query: ListPendingReviewsQuery,
  ): Promise<PaginatedResult<ReviewOutput>> {
    const result = await this.reviewRepository.findPaginated({
      page: query.pagination.page,
      limit: query.pagination.limit,
      status: REVIEW_STATUS.PENDING,
    });

    return this.mapReviewOutputsService.mapPaginatedWithAuthors(result);
  }
}
