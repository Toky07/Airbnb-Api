import { describe, expect, it } from 'vitest';
import {
  CreatePropertyCommand,
  PROPERTY_REPOSITORY,
  PROPERTY_TYPE_REPOSITORY,
  toPropertySummary,
} from './index';
import { toPropertySummary as leafToPropertySummary } from './property-summary';

describe('properties/contracts', () => {
  it('expose tokens et commands publics', () => {
    expect(PROPERTY_REPOSITORY).toBe('PROPERTY_REPOSITORY');
    expect(PROPERTY_TYPE_REPOSITORY).toBe('PROPERTY_TYPE_REPOSITORY');
    expect(
      new CreatePropertyCommand({
        name: 'A',
        description: 'B',
        address: 'C',
        city: 'D',
        country: 'E',
        latitude: 1,
        longitude: 2,
        checkInTime: '15:00',
        checkOutTime: '11:00',
        ownerId: 1,
      }),
    ).toBeInstanceOf(CreatePropertyCommand);
  });

  it('expose PropertySummary via contrat feuille (anti-cycle rooms)', () => {
    const summary = leafToPropertySummary({
      name: 'Hotel',
      description: 'Desc',
      address: '1 rue',
      city: 'Paris',
      country: 'France',
      latitude: 1,
      longitude: 2,
      checkInTime: '15:00',
      checkOutTime: '11:00',
      ownerId: 3,
      id: 9,
    });
    expect(summary.id).toBe(9);
    expect(summary.city).toBe('Paris');
    expect(summary).not.toHaveProperty('rooms');
    expect(summary).not.toHaveProperty('wifiPassword');
    expect(summary).not.toHaveProperty('checkInInstructions');
    expect(toPropertySummary).toBe(leafToPropertySummary);
  });
});
