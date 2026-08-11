import { Injectable } from '@nestjs/common';
import { ENTITY_TYPE } from '@src/modules/media/contracts';
import { QueryBus } from '@src/shared/useCase/bus/query-bus';
import { GetMediasByEntityQuery } from '@src/modules/media/contracts';
import { Media } from '@src/modules/media/contracts';
import {
  toRoomSummary,
  type RoomSummary,
} from '@src/modules/rooms/contracts/room-summary';
import type { Room } from '@src/modules/rooms/domain/entities/room.entity';
import { Property } from '@src/modules/properties/domain/entities/property.entity';
import { PropertyOutput } from '@src/modules/properties/applications/dto/property.output';

@Injectable()
export class PropertyMediaPresenter {
  async toOutput(property: Property): Promise<PropertyOutput> {
    const image = await this.getPropertyImage(property.id!);
    const rooms = await Promise.all(
      property.rooms.map((room) => this.roomToSummary(room)),
    );
    return PropertyOutput.fromDomain(property, image, rooms);
  }

  private async getPropertyImage(propertyId: number): Promise<string | null> {
    const medias = await QueryBus.execute<Media[]>(
      new GetMediasByEntityQuery(ENTITY_TYPE.PROPERTY, propertyId),
    );
    return medias[0]?.path ?? null;
  }

  private async roomToSummary(room: Room): Promise<RoomSummary> {
    const medias = room.id
      ? await QueryBus.execute<Media[]>(
          new GetMediasByEntityQuery(ENTITY_TYPE.ROOM, room.id),
        )
      : [];
    return toRoomSummary(
      room,
      medias.map((media) => media.path),
    );
  }
}
