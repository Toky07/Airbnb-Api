import { ForbiddenException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UpdateHostRoomCommandHandler } from './UpdateHostRoomCommandHandler';
import { UpdateHostRoomCommand } from '../commands/UpdateHostRoomCommand';
import { authUser, createResolveHostPropertyMock } from './host-test.helpers';

const mockQueryExecute = vi.fn();
const mockCommandExecute = vi.fn();

vi.mock('../../../../../shared/useCase/bus/query-bus', () => ({
  QueryBus: { execute: (...args: unknown[]) => mockQueryExecute(...args) },
}));

vi.mock('../../../../../shared/useCase/bus/bus', () => ({
  CommandBus: { execute: (...args: unknown[]) => mockCommandExecute(...args) },
}));

describe('UpdateHostRoomCommandHandler', () => {
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

  beforeEach(() => {
    vi.clearAllMocks();
    mockCommandExecute.mockResolvedValue({ id: 7, name: 'Suite' });
  });

  it('refuse une chambre qui n’appartient pas à l’établissement', async () => {
    mockQueryExecute.mockResolvedValue({
      id: 7,
      property: { id: 99 },
    });
    const handler = new UpdateHostRoomCommandHandler(
      createResolveHostPropertyMock() as never,
    );

    await expect(
      handler.execute(new UpdateHostRoomCommand(authUser, 1, 7, dto)),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
