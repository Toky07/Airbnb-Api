import { ForbiddenException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DeleteHostRoomCommandHandler } from './DeleteHostRoomCommandHandler';
import { DeleteHostRoomCommand } from '../commands/DeleteHostRoomCommand';
import { authUser, createResolveHostPropertyMock } from './host-test.helpers';

const mockQueryExecute = vi.fn();

vi.mock('../../../../../shared/useCase/bus/query-bus', () => ({
  QueryBus: { execute: (...args: unknown[]) => mockQueryExecute(...args) },
}));

describe('DeleteHostRoomCommandHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('refuse une chambre qui n’appartient pas à l’établissement', async () => {
    mockQueryExecute.mockResolvedValue({
      id: 7,
      property: { id: 99 },
    });
    const handler = new DeleteHostRoomCommandHandler(
      createResolveHostPropertyMock() as never,
    );

    await expect(
      handler.execute(new DeleteHostRoomCommand(authUser, 1, 7)),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
