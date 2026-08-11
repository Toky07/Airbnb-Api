import { BadRequestException } from '@nestjs/common';
import {
  AMENITY_SCOPE,
  type AmenityScope,
} from '@src/modules/amenity/domain/constants/amenity-scope.constant';

export function parseAmenityScope(value: unknown): AmenityScope | undefined {
  if (value == null || value === '') {
    return undefined;
  }

  if (typeof value !== 'string') {
    throw new BadRequestException('Le scope doit être "property" ou "room".');
  }

  const scope = value.trim();

  if (scope === AMENITY_SCOPE.PROPERTY || scope === AMENITY_SCOPE.ROOM) {
    return scope;
  }

  throw new BadRequestException('Le scope doit être "property" ou "room".');
}
