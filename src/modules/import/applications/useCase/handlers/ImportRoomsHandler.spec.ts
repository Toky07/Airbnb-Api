import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ImportRoomsHandler } from './ImportRoomsHandler';
import { createImportBatchContext } from './import-test.helpers';
import { CreateRoomCommand } from '../../../../rooms/contracts';
import { commandBusExecuteMock } from '../../../../../test/command-bus.mock';

describe('ImportRoomsHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    commandBusExecuteMock.mockResolvedValue({ id: 1 });
  });

  it('crée une chambre pour un établissement connu', async () => {
    const propertyRepository = {
      findById: vi.fn().mockResolvedValue({ id: 3, name: 'Hôtel Azur' }),
    };

    const context = createImportBatchContext({
      propertyNameToId: new Map([['Hôtel Azur', 3]]),
    });

    const handler = new ImportRoomsHandler(propertyRepository as never);

    const result = await handler.execute(
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
    expect(commandBusExecuteMock).toHaveBeenCalledTimes(1);
    expect(commandBusExecuteMock.mock.calls[0]?.[0]).toBeInstanceOf(
      CreateRoomCommand,
    );
  });

  it('signale un établissement introuvable', async () => {
    const handler = new ImportRoomsHandler({ findById: vi.fn() } as never);

    const result = await handler.execute(
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
