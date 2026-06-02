import { Injectable } from '@nestjs/common';
import { ENTITY_TYPE } from '../../../media/constant';
import { GetMediasByEntityUseCase } from '../../../media/applications/useCase/getMediasByEntity.usecase';
import { Room } from '../../domain/entities/room.entity';
import { RoomOutput } from '../dto/room.output';

@Injectable()
export class RoomMediaPresenter {
  constructor(
    private readonly getMediasByEntity: GetMediasByEntityUseCase,
  ) {}

  async toOutput(room: Room): Promise<RoomOutput> {
    const medias = room.id
      ? await this.getMediasByEntity.execute(ENTITY_TYPE.ROOM, room.id)
      : [];
    return RoomOutput.fromDomain(
      room,
      medias.map((media) => media.path),
    );
  }
}
