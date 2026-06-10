import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AMENITY_SCOPE } from '../../domain/constants/amenity-scope.constant';
import { PROPERTY_REPOSITORY } from '../../../properties/infrastructure/repositories/property.repository';
import type { IPropertyRepository } from '../../../properties/domain/repositories/property.repository';
import {
  PROPERTY_AMENITY_REPOSITORY,
  type IPropertyAmenityRepository,
} from '../../domain/repositories/property-amenity.repository';
import type { SyncAmenitiesDto } from '../dto/create-amenity.dto';
import { AmenityOutput } from '../dto/amenity.output';
import { ResolveAmenitiesService } from '../services/resolve-amenities.service';

@Injectable()
export class SyncPropertyAmenitiesUseCase {
  constructor(
    @Inject(PROPERTY_REPOSITORY)
    private readonly propertyRepository: IPropertyRepository,
    @Inject(PROPERTY_AMENITY_REPOSITORY)
    private readonly propertyAmenityRepository: IPropertyAmenityRepository,
    private readonly resolveAmenitiesService: ResolveAmenitiesService,
  ) {}

  async execute(
    propertyId: number,
    dto: SyncAmenitiesDto,
  ): Promise<AmenityOutput[]> {
    const property = await this.propertyRepository.findById(propertyId);
    if (!property) {
      throw new NotFoundException('Établissement introuvable');
    }

    const amenities = await this.resolveAmenitiesService.resolveActiveAmenities(
      dto.amenityIds ?? [],
      AMENITY_SCOPE.PROPERTY,
    );

    await this.propertyAmenityRepository.replaceForProperty(
      propertyId,
      amenities.map((amenity) => amenity.id!),
    );

    return this.resolveAmenitiesService.toOutputs(amenities);
  }
}
