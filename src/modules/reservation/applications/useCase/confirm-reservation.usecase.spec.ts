import { describe, expect, it, vi } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RESERVATION_STATUS } from '../../domain/constants/reservation-status.constant';
import { ConfirmReservationUseCase } from './confirm-reservation.usecase';
import {
  createReservationRepositoryMock,
  createSampleReservation,
} from './reservation-test.helpers';

describe('ConfirmReservationUseCase', () => {
  it('confirme une réservation en attente', async () => {
    const reservation = createSampleReservation({
      id: 4,
      status: RESERVATION_STATUS.PENDING,
    });
    const repository = createReservationRepositoryMock({
      findById: vi.fn().mockResolvedValue(reservation),
      update: vi.fn().mockImplementation(async (updated) => updated),
    });

    const useCase = new ConfirmReservationUseCase(repository);
    const result = await useCase.execute(4);

    expect(result.status).toBe(RESERVATION_STATUS.CONFIRMED);
  });

  it('retourne une réservation déjà confirmée', async () => {
    const reservation = createSampleReservation({
      id: 4,
      status: RESERVATION_STATUS.CONFIRMED,
    });

    const useCase = new ConfirmReservationUseCase(
      createReservationRepositoryMock({
        findById: vi.fn().mockResolvedValue(reservation),
      }),
    );

    const result = await useCase.execute(4);
    expect(result.status).toBe(RESERVATION_STATUS.CONFIRMED);
  });

  it('rejette la confirmation d’une réservation annulée', async () => {
    const reservation = createSampleReservation({
      id: 4,
      status: RESERVATION_STATUS.CANCELLED,
    });

    const useCase = new ConfirmReservationUseCase(
      createReservationRepositoryMock({
        findById: vi.fn().mockResolvedValue(reservation),
      }),
    );

    await expect(useCase.execute(4)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('lève une erreur si la réservation est introuvable', async () => {
    const useCase = new ConfirmReservationUseCase(
      createReservationRepositoryMock({
        findById: vi.fn().mockResolvedValue(null),
      }),
    );

    await expect(useCase.execute(99)).rejects.toBeInstanceOf(NotFoundException);
  });
});
