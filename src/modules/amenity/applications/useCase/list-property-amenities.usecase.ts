import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PROPERTY_REPOSITORY } from '../../../properties/infrastructure/repositories/property.repository';
import type { IPropertyRepository } from '../../../properties/domain/repositories/property.repository';
import {
  AMENITY_REPOSITORY,
  type IAmenityRepository,
} from '../../domain/repositories/amenity.repository';
import {
  PROPERTY_AMENITY_REPOSITORY,
  type IPropertyAmenityRepository,
} from '../../domain/repositories/property-amenity.repository';
import { AmenityOutput } from '../dto/amenity.output';

@Injectable()
export class ListPropertyAmenitiesUseCase {
  constructor(
    @Inject(PROPERTY_REPOSITORY)
    private readonly propertyRepository: IPropertyRepository,
    @Inject(PROPERTY_AMENITY_REPOSITORY)
    private readonly propertyAmenityRepository: IPropertyAmenityRepository,
    @Inject(AMENITY_REPOSITORY)
    private readonly amenityRepository: IAmenityRepository,
  ) {}

  async execute(propertyId: number): Promise<AmenityOutput[]> {
    const property = await this.propertyRepository.findById(propertyId);
    if (!property) {
      throw new NotFoundException('Établissement introuvable');
    }

    const amenityIds =
      await this.propertyAmenityRepository.findAmenityIdsByPropertyId(propertyId);
    const amenities = await this.amenityRepository.findByIds(amenityIds);
    return amenities.map(AmenityOutput.fromDomain);
  }
}
