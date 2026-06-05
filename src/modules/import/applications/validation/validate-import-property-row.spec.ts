import { describe, expect, it } from 'vitest';
import { validateImportPropertyRow } from './validate-import-property-row';

describe('validateImportPropertyRow', () => {
  it('valide un établissement', () => {
    expect(
      validateImportPropertyRow({
        name: 'Hotel Test',
        description: 'Description assez longue pour valider.',
        address: '1 rue',
        city: 'Paris',
        country: 'FR',
        latitude: 48,
        longitude: 2,
        checkInTime: '15:00',
        checkOutTime: '11:00',
        ownerEmail: 'owner@example.com',
      }).ok,
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
    expect(result.ok === false && result.field).toBe('ownerEmail');
  });
});
