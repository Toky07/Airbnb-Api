import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CreateHostPropertyCommandHandler } from './CreateHostPropertyCommandHandler';
import { CreateHostPropertyCommand } from '../commands/CreateHostPropertyCommand';
import { CreatePropertyCommand } from '../../../../properties/applications/useCase/commands/CreatePropertyCommand';
import {
  authUser,
  createResolveHostUserMock,
  propertyOutput,
} from './host-test.helpers';
import { commandBusExecuteMock } from '../../../../../test/command-bus.mock';

describe('CreateHostPropertyCommandHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    commandBusExecuteMock.mockResolvedValue(propertyOutput);
  });

  it('crée un établissement avec le propriétaire connecté', async () => {
    const resolveHostUser = createResolveHostUserMock();
    const handler = new CreateHostPropertyCommandHandler(
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
      new CreateHostPropertyCommand(authUser, dto),
    );

    expect(result).toEqual(propertyOutput);
    expect(commandBusExecuteMock).toHaveBeenCalledWith(
      new CreatePropertyCommand({ ...dto, ownerId: 5 }, undefined),
    );
  });
});
