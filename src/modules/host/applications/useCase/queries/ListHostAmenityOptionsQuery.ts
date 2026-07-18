import type { AmenityScope } from '../../../../amenity/domain/constants/amenity-scope.constant';

export class ListHostAmenityOptionsQuery {
  constructor(public readonly scope: AmenityScope) {}
}
