import { Injectable } from '@nestjs/common';
import { ENTITY_TYPE } from '../../../media/constant';
import { QueryBus } from '../../../../shared/useCase/bus/query-bus';
import { GetMediasByEntityQuery } from '../../../media/applications/useCase/queries/GetMediasByEntityQuery';
import { Media } from '../../../media/domain/entities/media.entity';
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
