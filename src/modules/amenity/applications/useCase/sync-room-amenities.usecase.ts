import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AMENITY_SCOPE } from '../../domain/constants/amenity-scope.constant';
import {
  ROOM_REPOSITORY,
  type IRoomRepository,
} from '../../../rooms/domain/repositories/room.repository';
import {
  ROOM_AMENITY_REPOSITORY,
  type IRoomAmenityRepository,
} from '../../domain/repositories/room-amenity.repository';
import type { SyncAmenitiesDto } from '../dto/create-amenity.dto';
import { AmenityOutput } from '../dto/amenity.output';
import { ResolveAmenitiesService } from '../services/resolve-amenities.service';

@Injectable()
export class SyncRoomAmenitiesUseCase {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
    @Inject(ROOM_AMENITY_REPOSITORY)
    private readonly roomAmenityRepository: IRoomAmenityRepository,
    private readonly resolveAmenitiesService: ResolveAmenitiesService,
  ) {}

  async execute(roomId: number, dto: SyncAmenitiesDto): Promise<AmenityOutput[]> {
    const room = await this.roomRepository.findById(roomId);
    if (!room) {
      throw new NotFoundException('Chambre introuvable');
    }

    const amenities = await this.resolveAmenitiesService.resolveActiveAmenities(
      dto.amenityIds ?? [],
      AMENITY_SCOPE.ROOM,
    );

    await this.roomAmenityRepository.replaceForRoom(
      roomId,
      amenities.map((amenity) => amenity.id!),
    );

    return this.resolveAmenitiesService.toOutputs(amenities);
  }
}
