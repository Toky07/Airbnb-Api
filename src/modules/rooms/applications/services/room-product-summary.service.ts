import { Inject, Injectable } from '@nestjs/common';
import { ENTITY_TYPE } from '@src/modules/media/contracts';
import { QueryBus } from '@src/shared/useCase/bus/query-bus';
import { GetMediasByEntityQuery } from '@src/modules/media/contracts';
import { Media } from '@src/modules/media/contracts';
import {
  ROOM_REPOSITORY,
  type IRoomRepository,
} from '@src/modules/rooms/domain/repositories/room.repository';

export type RoomProductSummary = {
  roomName: string;
  roomSlug: string;
  propertyId: number | null;
  propertyName: string;
  propertyCity: string | null;
  imageUrl: string | null;
};

@Injectable()
export class RoomProductSummaryService {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
  ) {}

  async getByRoomId(roomId: number): Promise<RoomProductSummary | null> {
    const room = await this.roomRepository.findById(Number(roomId));
    if (!room?.id) {
      return null;
    }

    const medias = await QueryBus.execute<Media[]>(
      new GetMediasByEntityQuery(ENTITY_TYPE.ROOM, room.id),
    );

    return {
      roomName: room.name,
      roomSlug: room.slug,
      propertyId: room.property?.id ?? null,
      propertyName: room.property?.name ?? 'Établissement',
      propertyCity: room.property?.city ?? null,
      imageUrl: medias[0]?.path ?? null,
    };
  }

  async getByRoomIds(
    roomIds: number[],
  ): Promise<Map<number, RoomProductSummary>> {
    const uniqueIds = [...new Set(roomIds.filter((id) => id > 0))];
    const summaries = new Map<number, RoomProductSummary>();

    await Promise.all(
      uniqueIds.map(async (roomId) => {
        const summary = await this.getByRoomId(roomId);
        if (summary) {
          summaries.set(roomId, summary);
        }
      }),
    );

    return summaries;
  }
}
