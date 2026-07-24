import { NotFoundException } from '@nestjs/common';
import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import type { IRoomRepository } from '../../../../rooms/domain/repositories/room.repository';
import type { IReviewRepository } from '../../../domain/repositories/review.repository';
import { RoomRatingSummaryOutput } from '../../dto/room-rating-summary.output';
import type { GetRoomRatingSummaryQuery } from '../queries/GetRoomRatingSummaryQuery';

export class GetRoomRatingSummaryQueryHandler implements IQueryHandler<
  GetRoomRatingSummaryQuery,
  RoomRatingSummaryOutput
> {
  constructor(
    private readonly reviewRepository: IReviewRepository,
    private readonly roomRepository: IRoomRepository,
  ) {}

  async execute(
    query: GetRoomRatingSummaryQuery,
  ): Promise<RoomRatingSummaryOutput> {
    const room = await this.roomRepository.findBySlug(query.slug);
    if (!room?.id) {
      throw new NotFoundException('Chambre introuvable.');
    }

    const summary = await this.reviewRepository.getRoomRatingSummary(room.id);
    return RoomRatingSummaryOutput.fromSummary(summary);
  }
}
