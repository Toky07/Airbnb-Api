import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CreateHostRoomCommandHandler } from './CreateHostRoomCommandHandler';
import { CreateHostRoomCommand } from '@src/modules/host/applications/useCase/commands/CreateHostRoomCommand';
import { CreateRoomCommand } from '@src/modules/rooms/contracts';
import {
  authUser,
  createResolveHostPropertyMock,
  hostProperty,
} from './host-test.helpers';
import { commandBusExecuteMock } from '@src/test/command-bus.mock';

describe('CreateHostRoomCommandHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    commandBusExecuteMock.mockResolvedValue({ id: 7, name: 'Suite' });
  });

  it('crée une chambre pour un établissement possédé', async () => {
    const resolveHostProperty = createResolveHostPropertyMock();
    const handler = new CreateHostRoomCommandHandler(
      resolveHostProperty as never,
    );

    const dto = {
      name: 'Suite',
      description: 'Description',
      pricePerNight: 120,
      maxGuests: 2,
      bedrooms: 1,
      bathrooms: 1,
      beds: 1,
      quantity: 1,
      size: 30,
      status: 'available',
    };

    await handler.execute(new CreateHostRoomCommand(authUser, 1, dto));

    expect(resolveHostProperty.requireOwned).toHaveBeenCalledWith(authUser, 1);
    expect(commandBusExecuteMock).toHaveBeenCalledWith(
      new CreateRoomCommand({ ...dto, property: hostProperty }, undefined),
    );
  });
});
