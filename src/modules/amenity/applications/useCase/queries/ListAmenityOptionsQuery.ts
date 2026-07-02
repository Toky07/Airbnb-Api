import type { AmenityScope } from '../../../domain/constants/amenity-scope.constant';

export class ListAmenityOptionsQuery {
  constructor(public readonly scope?: AmenityScope) {}
}
