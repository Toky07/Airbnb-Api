import { NotFoundException } from '@nestjs/common';
import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import type { IPropertyRepository } from '../../../../properties/domain/repositories/property.repository';
import type { IAmenityRepository } from '../../../domain/repositories/amenity.repository';
import type { IPropertyAmenityRepository } from '../../../domain/repositories/property-amenity.repository';
import { AmenityOutput } from '../../dto/amenity.output';
import type { ListPropertyAmenitiesQuery } from '../queries/ListPropertyAmenitiesQuery';

export class ListPropertyAmenitiesQueryHandler
  implements IQueryHandler<ListPropertyAmenitiesQuery, AmenityOutput[]>
{
  constructor(
    private readonly propertyRepository: IPropertyRepository,
    private readonly propertyAmenityRepository: IPropertyAmenityRepository,
    private readonly amenityRepository: IAmenityRepository,
  ) {}

  async execute(query: ListPropertyAmenitiesQuery): Promise<AmenityOutput[]> {
    const property = await this.propertyRepository.findById(query.propertyId);
    if (!property) {
      throw new NotFoundException('Établissement introuvable');
    }

    const amenityIds =
      await this.propertyAmenityRepository.findAmenityIdsByPropertyId(query.propertyId);
    const amenities = await this.amenityRepository.findByIds(amenityIds);
    return amenities.map(AmenityOutput.fromDomain);
  }
}
