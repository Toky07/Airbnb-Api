import type { AmenityScope } from '../../domain/constants/amenity-scope.constant';
import type { Amenity } from '../../domain/entities/amenity.entity';

export class AmenityOutput {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly icon: string,
    public readonly scope: AmenityScope,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static fromDomain(amenity: Amenity): AmenityOutput {
    return new AmenityOutput(
      amenity.id!,
      amenity.name,
      amenity.icon,
      amenity.scope,
      amenity.isActive,
      amenity.createdAt!,
      amenity.updatedAt!,
    );
  }
}
