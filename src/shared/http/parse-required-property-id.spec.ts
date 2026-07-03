import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { parseRequiredPropertyId } from './parse-required-property-id';

describe('parseRequiredPropertyId', () => {
  it('parse un propertyId valide', () => {
    expect(parseRequiredPropertyId({ propertyId: '3' })).toBe(3);
  });

  it('rejette un propertyId manquant', () => {
    expect(() => parseRequiredPropertyId({})).toThrow(BadRequestException);
  });
});
