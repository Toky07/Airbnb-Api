import { ForbiddenException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SyncHostRoomAmenitiesCommandHandler } from './SyncHostRoomAmenitiesCommandHandler';
import { SyncHostRoomAmenitiesCommand } from '../commands/SyncHostRoomAmenitiesCommand';
import { authUser, createResolveHostPropertyMock } from './host-test.helpers';

const mockQueryExecute = vi.fn();

vi.mock('../../../../../shared/useCase/bus/query-bus', () => ({
  QueryBus: { execute: (...args: unknown[]) => mockQueryExecute(...args) },
}));

describe('SyncHostRoomAmenitiesCommandHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('refuse une chambre qui n’appartient pas à l’établissement', async () => {
    mockQueryExecute.mockResolvedValue({
      id: 7,
      property: { id: 99 },
    });
    const handler = new SyncHostRoomAmenitiesCommandHandler(
      createResolveHostPropertyMock() as never,
    );

    await expect(
      handler.execute(
        new SyncHostRoomAmenitiesCommand(authUser, 1, 7, { amenityIds: [1] }),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
