import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  ROOM_REPOSITORY,
  type IRoomRepository,
} from '../../../rooms/domain/repositories/room.repository';
import {
  AMENITY_REPOSITORY,
  type IAmenityRepository,
} from '../../domain/repositories/amenity.repository';
import {
  ROOM_AMENITY_REPOSITORY,
  type IRoomAmenityRepository,
} from '../../domain/repositories/room-amenity.repository';
import { AmenityOutput } from '../dto/amenity.output';

@Injectable()
export class ListRoomAmenitiesUseCase {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
    @Inject(ROOM_AMENITY_REPOSITORY)
    private readonly roomAmenityRepository: IRoomAmenityRepository,
    @Inject(AMENITY_REPOSITORY)
    private readonly amenityRepository: IAmenityRepository,
  ) {}

  async execute(roomId: number): Promise<AmenityOutput[]> {
    const room = await this.roomRepository.findById(roomId);
    if (!room) {
      throw new NotFoundException('Chambre introuvable');
    }

    const amenityIds =
      await this.roomAmenityRepository.findAmenityIdsByRoomId(roomId);
    const amenities = await this.amenityRepository.findByIds(amenityIds);
    return amenities.map(AmenityOutput.fromDomain);
  }
}
