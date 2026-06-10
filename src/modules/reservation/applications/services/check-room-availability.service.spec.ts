import { describe, expect, it, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { CheckRoomAvailabilityService } from './check-room-availability.service';
import { createReservationRepositoryMock } from '../useCase/reservation-test.helpers';
import { createSampleReservation } from '../useCase/reservation-test.helpers';

describe('CheckRoomAvailabilityService', () => {
  it('ne lève pas d’erreur si aucun chevauchement', async () => {
    const service = new CheckRoomAvailabilityService(
      createReservationRepositoryMock({
        findOverlapping: vi.fn().mockResolvedValue([]),
      }),
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
    );

    await expect(
      service.ensureAvailable(10, '2026-07-01', '2026-07-03'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
