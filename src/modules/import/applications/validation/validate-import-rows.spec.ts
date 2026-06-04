import { describe, expect, it } from 'vitest';
import {
  parseImageUrlList,
  validateImportPropertyRow,
  validateImportRoomRow,
  validateImportUserRow,
} from './validate-import-rows';

describe('validate-import-rows', () => {
  it('valide un utilisateur', () => {
    expect(
      validateImportUserRow(
        {
          firstName: 'Jean',
          lastName: 'Dupont',
          email: 'jean@example.com',
          phoneNumber: '+33612345678',
        },
        0,
      ).ok,
    ).toBe(true);
  });

  it('rejette une propriété sans propriétaire', () => {
    const result = validateImportPropertyRow({
      name: 'Hotel Test',
      description: 'Description assez longue pour valider.',
      address: '1 rue',
      city: 'Paris',
      country: 'FR',
      latitude: 48,
      longitude: 2,
      checkInTime: '15:00',
      checkOutTime: '11:00',
      ownerEmail: '',
    });
    expect(result.ok).toBe(false);
  });

  it('parse les URLs d’images de chambre', () => {
    expect(parseImageUrlList('https://a.jpg; https://b.jpg')).toHaveLength(2);
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
  });
});
