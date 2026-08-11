import { describe, expect, it, vi } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Room } from '@src/modules/rooms/domain/entities/room.entity';
import { RoomBlockedDate } from '@src/modules/rooms/domain/entities/room-blocked-date.entity';
import type { IRoomRepository } from '@src/modules/rooms/domain/repositories/room.repository';
import type { IRoomBlockedDateRepository } from '@src/modules/rooms/domain/repositories/room-blocked-date.repository';
import { Property } from '@src/modules/properties/contracts';
import { CreateRoomBlockedDateCommandHandler } from './CreateRoomBlockedDateCommandHandler';
import { CreateRoomBlockedDateCommand } from '@src/modules/rooms/applications/useCase/commands/CreateRoomBlockedDateCommand';
import { DeleteRoomBlockedDateCommandHandler } from './DeleteRoomBlockedDateCommandHandler';
import { DeleteRoomBlockedDateCommand } from '@src/modules/rooms/applications/useCase/commands/DeleteRoomBlockedDateCommand';
import { ListRoomBlockedDatesQueryHandler } from './ListRoomBlockedDatesQueryHandler';
import { ListRoomBlockedDatesQuery } from '@src/modules/rooms/applications/useCase/queries/ListRoomBlockedDatesQuery';

const sampleRoom = new Room({
  id: 10,
  name: 'Suite',
  description: 'Desc',
  pricePerNight: 100,
  maxGuests: 2,
  bedrooms: 1,
  bathrooms: 1,
  beds: 1,
  quantity: 1,
  size: 20,
  status: 'available',
  property: new Property({
    id: 1,
    name: 'Hotel',
    description: 'D',
    address: 'A',
    city: 'C',
    country: 'F',
    latitude: 0,
    longitude: 0,
    checkInTime: '15:00',
    checkOutTime: '11:00',
    ownerId: 1,
  }),
});

function createBlockedRepo(
  overrides: Partial<IRoomBlockedDateRepository> = {},
): IRoomBlockedDateRepository {
  return {
    create: vi.fn().mockImplementation(async (blocked: RoomBlockedDate) =>
      Object.assign(blocked, {
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ),
    delete: vi.fn(),
    findById: vi.fn(),
    findByRoomId: vi.fn().mockResolvedValue([]),
    findOverlapping: vi.fn().mockResolvedValue([]),
    findRoomIdsUnavailable: vi.fn().mockResolvedValue([]),
    ...overrides,
  };
}

describe('RoomBlockedDate handlers', () => {
  it('crée une période bloquée', async () => {
    const handler = new CreateRoomBlockedDateCommandHandler(
      createBlockedRepo(),
      {
        findById: vi.fn().mockResolvedValue(sampleRoom),
      } as unknown as IRoomRepository,
    );

    const result = await handler.execute(
      new CreateRoomBlockedDateCommand(10, {
        startDate: '2026-08-01',
        endDate: '2026-08-05',
        reason: 'Travaux',
      }),
    );

    expect(result.id).toBe(1);
    expect(result.startDate).toBe('2026-08-01');
    expect(result.reason).toBe('Travaux');
  });

  it('rejette une plage invalide', async () => {
    const handler = new CreateRoomBlockedDateCommandHandler(
      createBlockedRepo(),
      {
        findById: vi.fn().mockResolvedValue(sampleRoom),
      } as unknown as IRoomRepository,
    );

    await expect(
      handler.execute(
        new CreateRoomBlockedDateCommand(10, {
          startDate: '2026-08-05',
          endDate: '2026-08-01',
        }),
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('liste les périodes d’une chambre', async () => {
    const handler = new ListRoomBlockedDatesQueryHandler(
      createBlockedRepo({
        findByRoomId: vi
          .fn()
          .mockResolvedValue([
            new RoomBlockedDate(
              10,
              '2026-08-01',
              '2026-08-05',
              null,
              1,
              new Date(),
              new Date(),
            ),
          ]),
      }),
    );

    const result = await handler.execute(new ListRoomBlockedDatesQuery(10));
    expect(result).toHaveLength(1);
    expect(result[0]?.startDate).toBe('2026-08-01');
  });

  it('supprime une période bloquée', async () => {
    const deleteFn = vi.fn();
    const handler = new DeleteRoomBlockedDateCommandHandler(
      createBlockedRepo({
        findById: vi
          .fn()
          .mockResolvedValue(
            new RoomBlockedDate(10, '2026-08-01', '2026-08-05', null, 3),
          ),
        delete: deleteFn,
      }),
    );

    await expect(
      handler.execute(new DeleteRoomBlockedDateCommand(10, 3)),
    ).resolves.toEqual({ status: true });
    expect(deleteFn).toHaveBeenCalledWith(3);
  });

  it('refuse de supprimer une période d’une autre chambre', async () => {
    const handler = new DeleteRoomBlockedDateCommandHandler(
      createBlockedRepo({
        findById: vi
          .fn()
          .mockResolvedValue(
            new RoomBlockedDate(99, '2026-08-01', '2026-08-05', null, 3),
          ),
      }),
    );

    await expect(
      handler.execute(new DeleteRoomBlockedDateCommand(10, 3)),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
