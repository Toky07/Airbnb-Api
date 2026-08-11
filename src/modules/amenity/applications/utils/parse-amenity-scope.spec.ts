import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { AMENITY_SCOPE } from '@src/modules/amenity/domain/constants/amenity-scope.constant';
import { parseAmenityScope } from './parse-amenity-scope';

describe('parseAmenityScope', () => {
  it('returns undefined for empty values', () => {
    expect(parseAmenityScope(undefined)).toBeUndefined();
    expect(parseAmenityScope(null)).toBeUndefined();
    expect(parseAmenityScope('')).toBeUndefined();
  });

  it('accepts valid scopes', () => {
    expect(parseAmenityScope('room')).toBe(AMENITY_SCOPE.ROOM);
    expect(parseAmenityScope('property')).toBe(AMENITY_SCOPE.PROPERTY);
  });

  it('rejects invalid scopes', () => {
    expect(() => parseAmenityScope('invalid')).toThrow(BadRequestException);
    expect(() => parseAmenityScope(42)).toThrow(BadRequestException);
  });
});
