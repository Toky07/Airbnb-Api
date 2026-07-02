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

describe('ConfirmReservationCommandHandler', () => {
  it('confirme une réservation en attente', async () => {
    const reservation = createSampleReservation({
      id: 4,
      status: RESERVATION_STATUS.PENDING,
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
          updated.id,
          updated.createdAt,
          updated.updatedAt,
        );
      }),
    });

    const handler = new ConfirmReservationCommandHandler(repository);
    const result = await handler.execute(new ConfirmReservationCommand(4));

    expect(result.status).toBe(RESERVATION_STATUS.CONFIRMED);
  });

  it('retourne une réservation déjà confirmée', async () => {
    const reservation = createSampleReservation({
      id: 4,
      status: RESERVATION_STATUS.CONFIRMED,
      items: [],
    });

    const handler = new ConfirmReservationCommandHandler(
      createReservationRepositoryMock({
        findById: vi.fn().mockResolvedValue(reservation),
        update: vi.fn().mockResolvedValue(reservation),
      }),
    );

    const result = await handler.execute(new ConfirmReservationCommand(4));
    expect(result.status).toBe(RESERVATION_STATUS.CONFIRMED);
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
    );

    await expect(
      handler.execute(new ConfirmReservationCommand(99)),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
