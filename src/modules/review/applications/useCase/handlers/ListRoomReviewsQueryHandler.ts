import { NotFoundException } from '@nestjs/common';
import type { IQueryHandler } from '@src/shared/useCase/bus/query-handler.interface';
import type { PaginatedResult } from '@src/shared/pagination/pagination.types';
import { REVIEW_STATUS } from '@src/modules/review/domain/constants/review-status.constant';
import type { IReviewRepository } from '@src/modules/review/domain/repositories/review.repository';
import type { IRoomRepository } from '@src/modules/rooms/contracts';
import { ReviewOutput } from '@src/modules/review/applications/dto/review.output';
import type { ListRoomReviewsQuery } from '@src/modules/review/applications/useCase/queries/ListRoomReviewsQuery';
import { MapReviewOutputsService } from '@src/modules/review/applications/services/map-review-outputs.service';

export class ListRoomReviewsQueryHandler implements IQueryHandler<
  ListRoomReviewsQuery,
  PaginatedResult<ReviewOutput>
> {
  constructor(
    private readonly reviewRepository: IReviewRepository,
    private readonly roomRepository: IRoomRepository,
    private readonly mapReviewOutputsService: MapReviewOutputsService,
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

    return this.mapReviewOutputsService.mapPaginatedWithAuthors(result);
  }
}
