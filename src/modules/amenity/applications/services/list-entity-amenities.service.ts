import { NotFoundException } from '@nestjs/common';
import type { IPropertyRepository } from '@src/modules/properties/contracts';
import type { IRoomRepository } from '@src/modules/rooms/contracts';
import type { IAmenityRepository } from '@src/modules/amenity/domain/repositories/amenity.repository';
import type { IPropertyAmenityRepository } from '@src/modules/amenity/domain/repositories/property-amenity.repository';
import type { IRoomAmenityRepository } from '@src/modules/amenity/domain/repositories/room-amenity.repository';
import { AmenityOutput } from '@src/modules/amenity/applications/dto/amenity.output';

export class ListEntityAmenitiesService {
  constructor(
    private readonly propertyRepository: IPropertyRepository,
    private readonly roomRepository: IRoomRepository,
    private readonly propertyAmenityRepository: IPropertyAmenityRepository,
    private readonly roomAmenityRepository: IRoomAmenityRepository,
    private readonly amenityRepository: IAmenityRepository,
  ) {}

  async listForProperty(propertyId: number): Promise<AmenityOutput[]> {
    const property = await this.propertyRepository.findById(propertyId);
    if (!property) {
      throw new NotFoundException('Établissement introuvable');
    }

    const amenityIds =
      await this.propertyAmenityRepository.findAmenityIdsByPropertyId(
        propertyId,
      );

    return this.toOutputs(amenityIds);
  }

  async listForRoom(roomId: number): Promise<AmenityOutput[]> {
    const room = await this.roomRepository.findById(roomId);
    if (!room) {
      throw new NotFoundException('Chambre introuvable');
    }

    const amenityIds =
      await this.roomAmenityRepository.findAmenityIdsByRoomId(roomId);

    return this.toOutputs(amenityIds);
  }

  private async toOutputs(amenityIds: number[]): Promise<AmenityOutput[]> {
    const amenities = await this.amenityRepository.findByIds(amenityIds);
    return amenities.map(AmenityOutput.fromDomain);
  }
}
