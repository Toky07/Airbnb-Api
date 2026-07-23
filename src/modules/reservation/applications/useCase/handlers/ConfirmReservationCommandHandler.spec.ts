import { describe, expect, it, vi } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RESERVATION_STATUS } from '../../../domain/constants/reservation-status.constant';
import { ConfirmReservationCommandHandler } from './ConfirmReservationCommandHandler';
import { ConfirmReservationCommand } from '../commands/ConfirmReservationCommand';
import {
  createReservationRepositoryMock,
  createSampleReservation,
  createSampleReservationItem,
} from '../reservation-test.helpers';
import { Reservation } from '../../../domain/entities/reservation.entity';
import { CheckRoomAvailabilityService } from '../../services/check-room-availability.service';
import type { IRoomBlockedDateRepository } from '../../../../rooms/domain/repositories/room-blocked-date.repository';

function createBlockedDateRepositoryMock(): IRoomBlockedDateRepository {
  return {
    create: vi.fn(),
    delete: vi.fn(),
    findById: vi.fn(),
    findByRoomId: vi.fn().mockResolvedValue([]),
    findOverlapping: vi.fn().mockResolvedValue([]),
    findRoomIdsUnavailable: vi.fn().mockResolvedValue([]),
  } as IRoomBlockedDateRepository;
}

function createAvailabilityService(
  reservationRepository = createReservationRepositoryMock(),
) {
  return new CheckRoomAvailabilityService(
    reservationRepository,
    createBlockedDateRepositoryMock(),
  );
}

describe('ConfirmReservationCommandHandler', () => {
  it('confirme une réservation en attente', async () => {
    const reservation = createSampleReservation({
      id: 4,
      status: RESERVATION_STATUS.PENDING,
      holdUntil: new Date(Date.now() + 60_000),
      items: [
        createSampleReservationItem({
          id: 1,
          reservationId: 4,
        }),
      ],
    });

    const repository = createReservationRepositoryMock({
      findById: vi.fn().mockResolvedValueOnce(reservation),
      update: vi.fn().mockImplementation(async (updated) => {
        return new Reservation(
          updated.userId,
          updated.items,
          RESERVATION_STATUS.CONFIRMED,
          updated.paymentId,
          updated.id,
          updated.createdAt,
          updated.updatedAt,
          null,
        );
      }),
    });

    const handler = new ConfirmReservationCommandHandler(
      repository,
      createAvailabilityService(repository),
    );
    const result = await handler.execute(new ConfirmReservationCommand(4));

    expect(result.status).toBe(RESERVATION_STATUS.CONFIRMED);
    expect(result.holdUntil).toBeNull();
  });

  it('retourne une réservation déjà confirmée', async () => {
    const reservation = createSampleReservation({
      id: 4,
      status: RESERVATION_STATUS.CONFIRMED,
      holdUntil: null,
      items: [],
    });

    const handler = new ConfirmReservationCommandHandler(
      createReservationRepositoryMock({
        findById: vi.fn().mockResolvedValue(reservation),
        update: vi.fn().mockResolvedValue(reservation),
      }),
      createAvailabilityService(),
    );

    const result = await handler.execute(new ConfirmReservationCommand(4));
    expect(result.status).toBe(RESERVATION_STATUS.CONFIRMED);
  });

  it('rejette un hold expiré et annule la réservation', async () => {
    const reservation = createSampleReservation({
      id: 4,
      status: RESERVATION_STATUS.PENDING,
      holdUntil: new Date(Date.now() - 60_000),
      items: [createSampleReservationItem({ id: 1, reservationId: 4 })],
    });
    const update = vi.fn().mockImplementation(async (updated) => updated);
    const handler = new ConfirmReservationCommandHandler(
      createReservationRepositoryMock({
        findById: vi.fn().mockResolvedValue(reservation),
        update,
      }),
      createAvailabilityService(),
    );

    await expect(
      handler.execute(new ConfirmReservationCommand(4)),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ status: RESERVATION_STATUS.CANCELLED }),
    );
  });

  it('rejette la confirmation d’une réservation annulée', async () => {
    const reservation = createSampleReservation({
      id: 4,
      status: RESERVATION_STATUS.CANCELLED,
      items: [],
    });

    const handler = new ConfirmReservationCommandHandler(
      createReservationRepositoryMock({
        findById: vi.fn().mockResolvedValue(reservation),
        update: vi.fn().mockResolvedValue(reservation),
      }),
      createAvailabilityService(),
    );

    await expect(
      handler.execute(new ConfirmReservationCommand(4)),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('lève une erreur si la réservation est introuvable', async () => {
    const handler = new ConfirmReservationCommandHandler(
      createReservationRepositoryMock({
        findById: vi.fn().mockResolvedValue(null),
      }),
      createAvailabilityService(),
    );

    await expect(
      handler.execute(new ConfirmReservationCommand(99)),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
