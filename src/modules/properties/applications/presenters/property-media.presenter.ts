import { Injectable } from '@nestjs/common';
import { ENTITY_TYPE } from '../../../media/constant';
import { QueryBus } from '../../../../shared/useCase/bus/query-bus';
import { GetMediasByEntityQuery } from '../../../media/applications/useCase/queries/GetMediasByEntityQuery';
import { Media } from '../../../media/domain/entities/media.entity';
import { RoomOutput } from '../../../rooms/applications/dto/room.output';
import { Room } from '../../../rooms/domain/entities/room.entity';
import { Property } from '../../domain/entities/property.entity';
import { PropertyOutput } from '../dto/property.outup';

@Injectable()
export class PropertyMediaPresenter {
  async toOutput(property: Property): Promise<PropertyOutput> {
    const image = await this.getPropertyImage(property.id!);
    const rooms = await Promise.all(
      property.rooms.map((room) => this.roomToOutput(room)),
    );
    return PropertyOutput.fromDomain(property, image, rooms);
  }

  private async getPropertyImage(propertyId: number): Promise<string | null> {
    const medias = await QueryBus.execute<Media[]>(
      new GetMediasByEntityQuery(ENTITY_TYPE.PROPERTY, propertyId),
    );
    return medias[0]?.path ?? null;
  }

  private async roomToOutput(room: Room): Promise<RoomOutput> {
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
