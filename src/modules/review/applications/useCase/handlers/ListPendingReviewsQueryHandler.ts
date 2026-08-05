import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import type { PaginatedResult } from '../../../../../shared/pagination/pagination.types';
import { REVIEW_STATUS } from '../../../domain/constants/review-status.constant';
import type { IReviewRepository } from '../../../domain/repositories/review.repository';
import { ReviewOutput } from '../../dto/review.output';
import type { ListPendingReviewsQuery } from '../queries/ListPendingReviewsQuery';
import { MapReviewOutputsService } from '../../services/map-review-outputs.service';

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
