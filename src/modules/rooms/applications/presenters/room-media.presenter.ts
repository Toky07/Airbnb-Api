import { Injectable } from '@nestjs/common';
import { ENTITY_TYPE } from '@src/modules/media/contracts';
import { QueryBus } from '@src/shared/useCase/bus/query-bus';
import { GetMediasByEntityQuery } from '@src/modules/media/contracts';
import { Media } from '@src/modules/media/contracts';
import { Room } from '@src/modules/rooms/domain/entities/room.entity';
import { RoomOutput } from '@src/modules/rooms/applications/dto/room.output';

@Injectable()
export class RoomMediaPresenter {
  async toOutput(room: Room): Promise<RoomOutput> {
    const medias = room.id
      ? await QueryBus.execute<Media[]>(
          new GetMediasByEntityQuery(ENTITY_TYPE.ROOM, room.id),
        )
      : [];
    return RoomOutput.fromDomain(
      room,
      medias.map((media) => media.path),
    );
  }
}
