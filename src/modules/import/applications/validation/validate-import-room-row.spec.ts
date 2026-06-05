import { describe, expect, it } from 'vitest';
import { parseImportRoomImageUrls } from './parse-import-room-image-urls';
import { validateImportRoomRow } from './validate-import-room-row';

describe('validateImportRoomRow', () => {
  it('valide une chambre', () => {
    expect(
      validateImportRoomRow({
        name: 'Suite',
        description: 'Description de chambre valide ici.',
        pricePerNight: 100,
        maxGuests: 2,
        bedrooms: 1,
        bathrooms: 1,
        beds: 1,
        quantity: 1,
        size: 25,
        status: 'available',
        propertyName: 'Hotel',
      }).ok,
    ).toBe(true);
  });

  it('rejette un statut de chambre inconnu', () => {
    const result = validateImportRoomRow({
      name: 'Suite',
      description: 'Description de chambre valide ici.',
      pricePerNight: 100,
      maxGuests: 2,
      bedrooms: 1,
      bathrooms: 1,
      beds: 1,
      quantity: 1,
      size: 25,
      status: 'invalid',
      propertyName: 'Hotel',
    });

    expect(result.ok).toBe(false);
    expect(result.ok === false && result.field).toBe('status');
  });
});

describe('parseImportRoomImageUrls', () => {
  it('parse les URLs séparées par point-virgule', () => {
    expect(parseImportRoomImageUrls('https://a.jpg; https://b.jpg')).toHaveLength(2);
  });

  it('retourne une liste vide sans valeur', () => {
    expect(parseImportRoomImageUrls()).toEqual([]);
  });
});
