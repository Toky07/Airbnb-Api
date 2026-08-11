import type { AmenityScope } from '@src/modules/amenity/domain/constants/amenity-scope.constant';

export class ListAmenitiesQuery {
  constructor(public readonly scope?: AmenityScope) {}
}
