import { describe, expect, it, vi } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RESERVATION_STATUS } from '../../domain/constants/reservation-status.constant';
import { ConfirmReservationUseCase } from './confirm-reservation.usecase';
import {
  createReservationRepositoryMock,
  createSampleReservation,
  createSampleReservationItem,
} from './reservation-test.helpers';

function createEnrichMock() {
  return {
    enrich: vi.fn().mockImplementation(async (outputs: unknown[]) => outputs),
  };
}

describe('ConfirmReservationUseCase', () => {
  it('confirme une réservation en attente', async () => {
    const reservation = createSampleReservation({
      id: 4,
      items: [
        createSampleReservationItem({
          id: 1,
          reservationId: 4,
          status: RESERVATION_STATUS.PENDING,
        }),
      ],
    });
    const repository = createReservationRepositoryMock({
      findById: vi
        .fn()
        .mockResolvedValueOnce(reservation)
        .mockResolvedValueOnce(
          createSampleReservation({
            id: 4,
            items: [
              createSampleReservationItem({
                id: 1,
                reservationId: 4,
                status: RESERVATION_STATUS.CONFIRMED,
              }),
            ],
          }),
        ),
      updateItem: vi.fn().mockImplementation(async (updated) => updated),
    });

    const useCase = new ConfirmReservationUseCase(
      repository,
      createEnrichMock() as never,
    );
    const result = await useCase.execute(4);

    expect(result.items[0]?.status).toBe(RESERVATION_STATUS.CONFIRMED);
  });

  it('retourne une réservation déjà confirmée', async () => {
    const reservation = createSampleReservation({
      id: 4,
      items: [
        createSampleReservationItem({
          id: 1,
          reservationId: 4,
          status: RESERVATION_STATUS.CONFIRMED,
        }),
      ],
    });

    const useCase = new ConfirmReservationUseCase(
      createReservationRepositoryMock({
        findById: vi.fn().mockResolvedValue(reservation),
      }),
      createEnrichMock() as never,
    );

    const result = await useCase.execute(4);
    expect(result.items[0]?.status).toBe(RESERVATION_STATUS.CONFIRMED);
  });

  it('rejette la confirmation d’une réservation annulée', async () => {
    const reservation = createSampleReservation({
      id: 4,
      items: [
        createSampleReservationItem({
          id: 1,
          reservationId: 4,
          status: RESERVATION_STATUS.CANCELLED,
        }),
      ],
    });

    const useCase = new ConfirmReservationUseCase(
      createReservationRepositoryMock({
        findById: vi.fn().mockResolvedValue(reservation),
      }),
      createEnrichMock() as never,
    );

    await expect(useCase.execute(4)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('lève une erreur si la réservation est introuvable', async () => {
    const useCase = new ConfirmReservationUseCase(
      createReservationRepositoryMock({
        findById: vi.fn().mockResolvedValue(null),
      }),
      createEnrichMock() as never,
    );

    await expect(useCase.execute(99)).rejects.toBeInstanceOf(NotFoundException);
  });
});
