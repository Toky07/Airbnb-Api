import type { IQueryHandler } from '@src/shared/useCase/bus/query-handler.interface';
import type { IRoomRepository } from '@src/modules/rooms/contracts';
import { assertPubliclyListedRoom } from '@src/modules/rooms/contracts';
import type { IReviewRepository } from '@src/modules/review/domain/repositories/review.repository';
import { RoomRatingSummaryOutput } from '@src/modules/review/applications/dto/room-rating-summary.output';
import type { GetRoomRatingSummaryQuery } from '@src/modules/review/applications/useCase/queries/GetRoomRatingSummaryQuery';

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
    assertPubliclyListedRoom(room);

    const summary = await this.reviewRepository.getRoomRatingSummary(room.id);
    return RoomRatingSummaryOutput.fromSummary(summary);
  }
}
