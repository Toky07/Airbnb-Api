import { NotFoundException } from '@nestjs/common';
import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import type { PaginatedResult } from '../../../../../shared/pagination/pagination.types';
import { REVIEW_STATUS } from '../../../domain/constants/review-status.constant';
import type { IReviewRepository } from '../../../domain/repositories/review.repository';
import type { IRoomRepository } from '../../../../rooms/domain/repositories/room.repository';
import type { IUserRepository } from '../../../../user/domain/repositories/user.repository';
import { ReviewOutput } from '../../dto/review.output';
import type { ListRoomReviewsQuery } from '../queries/ListRoomReviewsQuery';

export class ListRoomReviewsQueryHandler implements IQueryHandler<
  ListRoomReviewsQuery,
  PaginatedResult<ReviewOutput>
> {
  constructor(
    private readonly reviewRepository: IReviewRepository,
    private readonly roomRepository: IRoomRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    query: ListRoomReviewsQuery,
  ): Promise<PaginatedResult<ReviewOutput>> {
    const room = await this.roomRepository.findBySlug(query.slug);
    if (!room?.id) {
      throw new NotFoundException('Chambre introuvable.');
    }

    const result = await this.reviewRepository.findPaginated({
      page: query.pagination.page,
      limit: query.pagination.limit,
      roomId: room.id,
      status: REVIEW_STATUS.PUBLISHED,
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
