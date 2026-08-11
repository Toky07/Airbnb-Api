import { ForbiddenException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DeleteHostRoomCommandHandler } from './DeleteHostRoomCommandHandler';
import { DeleteHostRoomCommand } from '@src/modules/host/applications/useCase/commands/DeleteHostRoomCommand';
import {
  authUser,
  createAssertHostRoomOwnershipMock,
} from './host-test.helpers';

describe('DeleteHostRoomCommandHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('refuse une chambre qui n’appartient pas à l’établissement', async () => {
    const handler = new DeleteHostRoomCommandHandler(
      createAssertHostRoomOwnershipMock(true) as never,
    );

    await expect(
      handler.execute(new DeleteHostRoomCommand(authUser, 1, 7)),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
