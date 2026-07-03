import { NotFoundException } from '@nestjs/common';
import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import type { IRoomRepository } from '../../../../rooms/domain/repositories/room.repository';
import type { IAmenityRepository } from '../../../domain/repositories/amenity.repository';
import type { IRoomAmenityRepository } from '../../../domain/repositories/room-amenity.repository';
import { AmenityOutput } from '../../dto/amenity.output';
import type { ListRoomAmenitiesQuery } from '../queries/ListRoomAmenitiesQuery';

export class ListRoomAmenitiesQueryHandler implements IQueryHandler<
  ListRoomAmenitiesQuery,
  AmenityOutput[]
> {
  constructor(
    private readonly roomRepository: IRoomRepository,
    private readonly roomAmenityRepository: IRoomAmenityRepository,
    private readonly amenityRepository: IAmenityRepository,
  ) {}

  async execute(query: ListRoomAmenitiesQuery): Promise<AmenityOutput[]> {
    const room = await this.roomRepository.findById(query.roomId);
    if (!room) {
      throw new NotFoundException('Chambre introuvable');
    }

    const amenityIds = await this.roomAmenityRepository.findAmenityIdsByRoomId(
      query.roomId,
    );
    const amenities = await this.amenityRepository.findByIds(amenityIds);
    return amenities.map(AmenityOutput.fromDomain);
  }
}
