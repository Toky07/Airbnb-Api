import { ForbiddenException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SyncHostRoomAmenitiesCommandHandler } from './SyncHostRoomAmenitiesCommandHandler';
import { SyncHostRoomAmenitiesCommand } from '@src/modules/host/applications/useCase/commands/SyncHostRoomAmenitiesCommand';
import {
  authUser,
  createAssertHostRoomOwnershipMock,
} from './host-test.helpers';

describe('SyncHostRoomAmenitiesCommandHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('refuse une chambre qui n’appartient pas à l’établissement', async () => {
    const handler = new SyncHostRoomAmenitiesCommandHandler(
      createAssertHostRoomOwnershipMock(true) as never,
    );

    await expect(
      handler.execute(
        new SyncHostRoomAmenitiesCommand(authUser, 1, 7, { amenityIds: [1] }),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
