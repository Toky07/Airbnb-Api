import type { AmenityScope } from '@src/modules/amenity/contracts';

export class ListHostAmenityOptionsQuery {
  constructor(public readonly scope: AmenityScope) {}
}
