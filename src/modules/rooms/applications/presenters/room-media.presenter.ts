import { Injectable } from '@nestjs/common';
import { ENTITY_TYPE } from '../../../media/contracts';
import { QueryBus } from '../../../../shared/useCase/bus/query-bus';
import { GetMediasByEntityQuery } from '../../../media/contracts';
import { Media } from '../../../media/contracts';
import { Room } from '../../domain/entities/room.entity';
import { RoomOutput } from '../dto/room.output';

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
