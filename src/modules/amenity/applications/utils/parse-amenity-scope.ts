import { BadRequestException } from '@nestjs/common';
import {
  AMENITY_SCOPE,
  type AmenityScope,
} from '../../domain/constants/amenity-scope.constant';

export function parseAmenityScope(value: unknown): AmenityScope | undefined {
  if (value == null || value === '') {
    return undefined;
  }

  const scope = String(value).trim();

  if (scope === AMENITY_SCOPE.PROPERTY || scope === AMENITY_SCOPE.ROOM) {
    return scope;
  }

  throw new BadRequestException('Le scope doit être "property" ou "room".');
}
