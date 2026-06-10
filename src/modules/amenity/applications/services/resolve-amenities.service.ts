import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { AmenityScope } from '../../domain/constants/amenity-scope.constant';
import { Amenity } from '../../domain/entities/amenity.entity';
import {
  AMENITY_REPOSITORY,
  type IAmenityRepository,
} from '../../domain/repositories/amenity.repository';
import { AmenityOutput } from '../dto/amenity.output';

@Injectable()
export class ResolveAmenitiesService {
  constructor(
    @Inject(AMENITY_REPOSITORY)
    private readonly amenityRepository: IAmenityRepository,
  ) {}

  async resolveActiveAmenities(
    amenityIds: number[],
    expectedScope: AmenityScope,
  ): Promise<Amenity[]> {
    const uniqueIds = [...new Set(amenityIds)];

    if (uniqueIds.length === 0) {
      return [];
    }

    const amenities = await this.amenityRepository.findByIds(uniqueIds);

    if (amenities.length !== uniqueIds.length) {
      throw new BadRequestException('Un ou plusieurs équipements sont introuvables');
    }

    const wrongScope = amenities.find((amenity) => amenity.scope !== expectedScope);
    if (wrongScope) {
      throw new BadRequestException(
        `L'équipement "${wrongScope.name}" n'est pas compatible avec ce type d'hébergement`,
      );
    }

    const inactive = amenities.find((amenity) => !amenity.isActive);
    if (inactive) {
      throw new BadRequestException(
        `L'équipement "${inactive.name}" n'est pas actif`,
      );
    }

    return amenities;
  }

  async toOutputs(amenities: Amenity[]): Promise<AmenityOutput[]> {
    return amenities.map(AmenityOutput.fromDomain);
  }
}
