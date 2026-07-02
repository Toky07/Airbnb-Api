import type { AmenityScope } from '../../../domain/constants/amenity-scope.constant';

export class ListAmenitiesQuery {
  constructor(public readonly scope?: AmenityScope) {}
}
