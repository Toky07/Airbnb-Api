import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SyncHostPropertyAmenitiesCommandHandler } from './SyncHostPropertyAmenitiesCommandHandler';
import { SyncHostPropertyAmenitiesCommand } from '@src/modules/host/applications/useCase/commands/SyncHostPropertyAmenitiesCommand';
import { SyncPropertyAmenitiesCommand } from '@src/modules/amenity/contracts';
import { authUser, createResolveHostPropertyMock } from './host-test.helpers';
import { commandBusExecuteMock } from '@src/test/command-bus.mock';

describe('SyncHostPropertyAmenitiesCommandHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    commandBusExecuteMock.mockResolvedValue([{ id: 1, name: 'Piscine' }]);
  });

  it('synchronise les équipements d’un établissement possédé', async () => {
    const resolveHostProperty = createResolveHostPropertyMock();
    const handler = new SyncHostPropertyAmenitiesCommandHandler(
      resolveHostProperty as never,
    );
    const dto = { amenityIds: [1] };

    const result = await handler.execute(
      new SyncHostPropertyAmenitiesCommand(authUser, 1, dto),
    );

    expect(resolveHostProperty.requireOwned).toHaveBeenCalledWith(authUser, 1);
    expect(commandBusExecuteMock).toHaveBeenCalledWith(
      new SyncPropertyAmenitiesCommand(1, dto),
    );
    expect(result).toEqual([{ id: 1, name: 'Piscine' }]);
  });
});
