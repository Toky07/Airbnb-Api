import { describe, expect, it, vi } from 'vitest';
import { ImportRoomsUseCase } from './import-rooms.usecase';
import { createImportBatchContext } from './import-test.helpers';

describe('ImportRoomsUseCase', () => {
  it('crée une chambre pour un établissement connu', async () => {
    const createRoom = { execute: vi.fn().mockResolvedValue({ id: 1 }) };
    const propertyRepository = {
      findById: vi.fn().mockResolvedValue({ id: 3, name: 'Hôtel Azur' }),
    };

    const context = createImportBatchContext({
      propertyNameToId: new Map([['Hôtel Azur', 3]]),
    });

    const useCase = new ImportRoomsUseCase(
      createRoom as never,
      propertyRepository as never,
    );

    const result = await useCase.execute(
      [
        {
          name: 'Suite',
          description: 'Description de chambre valide ici.',
          pricePerNight: 120,
          maxGuests: 2,
          bedrooms: 1,
          bathrooms: 1,
          beds: 1,
          quantity: 1,
          size: 30,
          status: 'available',
          propertyName: 'Hôtel Azur',
        },
      ],
      context,
    );

    expect(result.created).toBe(1);
    expect(createRoom.execute).toHaveBeenCalledTimes(1);
  });

  it('signale un établissement introuvable', async () => {
    const useCase = new ImportRoomsUseCase(
      { execute: vi.fn() } as never,
      { findById: vi.fn() } as never,
    );

    const result = await useCase.execute(
      [
        {
          name: 'Suite',
          description: 'Description de chambre valide ici.',
          pricePerNight: 120,
          maxGuests: 2,
          bedrooms: 1,
          bathrooms: 1,
          beds: 1,
          quantity: 1,
          size: 30,
          status: 'available',
          propertyName: 'Inconnu',
        },
      ],
      createImportBatchContext(),
    );

    expect(result.created).toBe(0);
    expect(result.errors[0]?.field).toBe('propertyName');
  });
});
