import { NotFoundException } from '@nestjs/common';
import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import type { PaginatedResult } from '../../../../../shared/pagination/pagination.types';
import type { IReviewRepository } from '../../../domain/repositories/review.repository';
import type { IUserRepository } from '../../../../user/domain/repositories/user.repository';
import { ReviewOutput } from '../../dto/review.output';
import type { ListMyReviewsQuery } from '../queries/ListMyReviewsQuery';

export class ListMyReviewsQueryHandler implements IQueryHandler<
  ListMyReviewsQuery,
  PaginatedResult<ReviewOutput>
> {
  constructor(
    private readonly reviewRepository: IReviewRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    query: ListMyReviewsQuery,
  ): Promise<PaginatedResult<ReviewOutput>> {
    const user = await this.userRepository.findByAuthId(query.authId);
    if (!user?.id) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

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
