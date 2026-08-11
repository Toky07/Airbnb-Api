import { NotFoundException } from '@nestjs/common';
import type { IPropertyRepository } from '@src/modules/properties/contracts';
import type { IRoomRepository } from '@src/modules/rooms/contracts';
import type { IPropertyAmenityRepository } from '@src/modules/amenity/domain/repositories/property-amenity.repository';
import type { IRoomAmenityRepository } from '@src/modules/amenity/domain/repositories/room-amenity.repository';
import { AMENITY_SCOPE } from '@src/modules/amenity/domain/constants/amenity-scope.constant';
import type { AmenityScope } from '@src/modules/amenity/domain/constants/amenity-scope.constant';
import { AmenityOutput } from '@src/modules/amenity/applications/dto/amenity.output';
import type { ResolveAmenitiesService } from './resolve-amenities.service';

export class SyncEntityAmenitiesService {
  constructor(
    private readonly propertyRepository: IPropertyRepository,
    private readonly roomRepository: IRoomRepository,
    private readonly propertyAmenityRepository: IPropertyAmenityRepository,
    private readonly roomAmenityRepository: IRoomAmenityRepository,
    private readonly resolveAmenitiesService: ResolveAmenitiesService,
  ) {}

  async syncProperty(
    propertyId: number,
    amenityIds: number[],
  ): Promise<AmenityOutput[]> {
    const property = await this.propertyRepository.findById(propertyId);
    if (!property) {
      throw new NotFoundException('Établissement introuvable');
    }

    return this.sync(amenityIds, AMENITY_SCOPE.PROPERTY, (ids) =>
      this.propertyAmenityRepository.replaceForProperty(propertyId, ids),
    );
  }

  async syncRoom(
    roomId: number,
    amenityIds: number[],
  ): Promise<AmenityOutput[]> {
    const room = await this.roomRepository.findById(roomId);
    if (!room) {
      throw new NotFoundException('Chambre introuvable');
    }

    return this.sync(amenityIds, AMENITY_SCOPE.ROOM, (ids) =>
      this.roomAmenityRepository.replaceForRoom(roomId, ids),
    );
  }

  private async sync(
    amenityIds: number[],
    scope: AmenityScope,
    replace: (ids: number[]) => Promise<void>,
  ): Promise<AmenityOutput[]> {
    const amenities = await this.resolveAmenitiesService.resolveActiveAmenities(
      amenityIds,
      scope,
    );

    await replace(amenities.map((amenity) => amenity.id!));

    return this.resolveAmenitiesService.toOutputs(amenities);
  }
}
