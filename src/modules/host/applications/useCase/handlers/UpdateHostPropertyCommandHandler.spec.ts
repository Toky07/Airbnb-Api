import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UpdateHostPropertyCommandHandler } from './UpdateHostPropertyCommandHandler';
import { UpdateHostPropertyCommand } from '@src/modules/host/applications/useCase/commands/UpdateHostPropertyCommand';
import { UpdatePropertyCommand } from '@src/modules/properties/contracts';
import {
  authUser,
  createResolveHostPropertyMock,
  createResolveHostUserMock,
  propertyOutput,
} from './host-test.helpers';
import { commandBusExecuteMock } from '@src/test/command-bus.mock';

describe('UpdateHostPropertyCommandHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    commandBusExecuteMock.mockResolvedValue(propertyOutput);
  });

  it('met à jour un établissement possédé', async () => {
    const resolveHostProperty = createResolveHostPropertyMock();
    const resolveHostUser = createResolveHostUserMock();
    const handler = new UpdateHostPropertyCommandHandler(
      resolveHostProperty as never,
      resolveHostUser as never,
    );

    const dto = {
      name: 'Hôtel Azur',
      description: 'Description',
      address: '1 rue',
      city: 'Nice',
      country: 'France',
      latitude: 43.7,
      longitude: 7.2,
      checkInTime: '15:00',
      checkOutTime: '11:00',
    };

    const result = await handler.execute(
      new UpdateHostPropertyCommand(authUser, 1, dto),
    );

    expect(result).toEqual(propertyOutput);
    expect(resolveHostProperty.requireOwned).toHaveBeenCalledWith(authUser, 1);
    expect(commandBusExecuteMock).toHaveBeenCalledWith(
      new UpdatePropertyCommand(1, { ...dto, ownerId: 5 }, undefined),
    );
  });
});
