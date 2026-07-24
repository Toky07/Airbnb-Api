import { describe, expect, it } from 'vitest';
import {
  parseAdvancedFilterFields,
  parseAmenityIds,
} from './parse-advanced-filter-query';

describe('parseAmenityIds', () => {
  it('parse une liste séparée par des virgules', () => {
    expect(parseAmenityIds({ amenityIds: '1,2,3' })).toEqual([1, 2, 3]);
  });

  it('dédoublonne les identifiants', () => {
    expect(parseAmenityIds({ amenityIds: '1,1,2' })).toEqual([1, 2]);
  });

  it('ignore les valeurs invalides', () => {
    expect(parseAmenityIds({ amenityIds: '0,-1,abc' })).toBeUndefined();
  });
});

describe('parseAdvancedFilterFields', () => {
  it('parse les filtres avancés', () => {
    expect(
      parseAdvancedFilterFields({
        minPrice: '50',
        maxPrice: '200',
        minGuests: '2',
        roomTypeId: '3',
        city: ' Nice ',
        amenityIds: '1,2',
      }),
    ).toEqual({
      minPrice: 50,
      maxPrice: 200,
      minGuests: 2,
      roomTypeId: 3,
      amenityIds: [1, 2],
      city: 'Nice',
      status: undefined,
      lat: undefined,
      lng: undefined,
      radiusKm: undefined,
    });
  });

  it('ignore maxPrice inférieur à minPrice', () => {
    expect(
      parseAdvancedFilterFields({
        minPrice: '200',
        maxPrice: '50',
      }).maxPrice,
    ).toBeUndefined();
  });

  it('parse la géolocalisation avec un rayon par défaut', () => {
    expect(
      parseAdvancedFilterFields({
        lat: '48.8566',
        lng: '2.3522',
      }),
    ).toEqual(
      expect.objectContaining({
        lat: 48.8566,
        lng: 2.3522,
        radiusKm: 25,
      }),
    );
  });

  it('borne le rayon à 100 km', () => {
    expect(
      parseAdvancedFilterFields({
        lat: '48.8566',
        lng: '2.3522',
        radiusKm: '500',
      }).radiusKm,
    ).toBe(100);
  });
});
