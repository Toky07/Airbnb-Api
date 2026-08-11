import type { AmenityScope } from '@src/modules/amenity/domain/constants/amenity-scope.constant';

export class Amenity {
  constructor(
    public readonly name: string,
    public readonly icon: string,
    public readonly scope: AmenityScope,
    public readonly isActive: boolean,
    public readonly id?: number,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
