import { Inject, Injectable } from '@nestjs/common';
import type { AmenityScope } from '../../domain/constants/amenity-scope.constant';
import {
  AMENITY_REPOSITORY,
  type IAmenityRepository,
} from '../../domain/repositories/amenity.repository';
import { AmenityOutput } from '../dto/amenity.output';

@Injectable()
export class ListAmenitiesUseCase {
  constructor(
    @Inject(AMENITY_REPOSITORY)
    private readonly repository: IAmenityRepository,
  ) {}

  async execute(scope?: AmenityScope): Promise<AmenityOutput[]> {
    const amenities = await this.repository.findAll(scope);
    return amenities.map(AmenityOutput.fromDomain);
  }
}
