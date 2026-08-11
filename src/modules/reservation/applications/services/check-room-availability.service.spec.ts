import { describe, expect, it, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { CheckRoomAvailabilityService } from './check-room-availability.service';
import {
  createReservationRepositoryMock,
  createSampleReservation,
} from '@src/modules/reservation/applications/useCase/reservation-test.helpers';
import type { IRoomBlockedDateRepository } from '@src/modules/rooms/contracts';

function createBlockedDateRepositoryMock(
  overrides: Partial<IRoomBlockedDateRepository> = {},
): IRoomBlockedDateRepository {
  return {
    create: vi.fn(),
    delete: vi.fn(),
    findById: vi.fn(),
    findByRoomId: vi.fn().mockResolvedValue([]),
    findOverlapping: vi.fn().mockResolvedValue([]),
    findRoomIdsUnavailable: vi.fn().mockResolvedValue([]),
    ...overrides,
  };
}

describe('CheckRoomAvailabilityService', () => {
  it('ne lève pas d’erreur si aucun chevauchement', async () => {
    const service = new CheckRoomAvailabilityService(
      createReservationRepositoryMock({
        findOverlapping: vi.fn().mockResolvedValue([]),
      }),
      createBlockedDateRepositoryMock(),
    );

    await expect(
      service.ensureAvailable(10, '2026-07-01', '2026-07-03'),
    ).resolves.toBeUndefined();
  });

  it('rejette si une réservation chevauche les dates', async () => {
    const service = new CheckRoomAvailabilityService(
      createReservationRepositoryMock({
        findOverlapping: vi
          .fn()
          .mockResolvedValue([createSampleReservation({ id: 2 })]),
      }),
      createBlockedDateRepositoryMock(),
    );

    await expect(
      service.ensureAvailable(10, '2026-07-01', '2026-07-03'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejette si une période bloquée chevauche les dates', async () => {
    const service = new CheckRoomAvailabilityService(
      createReservationRepositoryMock(),
      createBlockedDateRepositoryMock({
        findOverlapping: vi.fn().mockResolvedValue([
          {
            roomId: 10,
            startDate: '2026-07-01',
            endDate: '2026-07-05',
            reason: null,
            id: 1,
          },
        ]),
      }),
    );

    await expect(
      service.ensureAvailable(10, '2026-07-01', '2026-07-03'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
