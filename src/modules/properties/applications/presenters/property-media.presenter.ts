import { Injectable } from '@nestjs/common';
import { ENTITY_TYPE } from '../../../media/constant';
import { GetMediasByEntityUseCase } from '../../../media/applications/useCase/getMediasByEntity.usecase';
import { RoomOutput } from '../../../rooms/applications/dto/room.output';
import { Room } from '../../../rooms/domain/entities/room.entity';
import { Property } from '../../domain/entities/property.entity';
import { PropertyOutput } from '../dto/property.outup';

@Injectable()
export class PropertyMediaPresenter {
  constructor(
    private readonly getMediasByEntity: GetMediasByEntityUseCase,
  ) {}

  async toOutput(property: Property): Promise<PropertyOutput> {
    const image = await this.getPropertyImage(property.id!);
    const rooms = await Promise.all(
      property.rooms.map((room) => this.roomToOutput(room)),
    );
    return PropertyOutput.fromDomain(property, image, rooms);
  }

  private async getPropertyImage(propertyId: number): Promise<string | null> {
    const medias = await this.getMediasByEntity.execute(
      ENTITY_TYPE.PROPERTY,
      propertyId,
    );
    return medias[0]?.path ?? null;
  }

  private async roomToOutput(room: Room): Promise<RoomOutput> {
    const medias = room.id
      ? await this.getMediasByEntity.execute(ENTITY_TYPE.ROOM, room.id)
      : [];
    return RoomOutput.fromDomain(
      room,
      medias.map((media) => media.path),
    );
  }
}
