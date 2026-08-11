import { ForbiddenException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GetHostRoomAmenitiesQueryHandler } from './GetHostRoomAmenitiesQueryHandler';
import { GetHostRoomAmenitiesQuery } from '@src/modules/host/applications/useCase/queries/GetHostRoomAmenitiesQuery';
import {
  authUser,
  createAssertHostRoomOwnershipMock,
} from './host-test.helpers';

describe('GetHostRoomAmenitiesQueryHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('refuse une chambre qui n’appartient pas à l’établissement', async () => {
    const handler = new GetHostRoomAmenitiesQueryHandler(
      createAssertHostRoomOwnershipMock(true) as never,
    );

    await expect(
      handler.execute(new GetHostRoomAmenitiesQuery(authUser, 1, 7)),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
