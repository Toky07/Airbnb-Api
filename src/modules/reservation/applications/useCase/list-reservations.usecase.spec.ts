import { describe, expect, it, vi } from 'vitest';
import { ListReservationsUseCase } from './list-reservations.usecase';
import {
  createReservationRepositoryMock,
  createSampleReservation,
} from './reservation-test.helpers';

describe('ListReservationsUseCase', () => {
  it('retourne une liste paginée de réservations', async () => {
    const repository = createReservationRepositoryMock({
      findPaginated: vi.fn().mockResolvedValue({
        data: [createSampleReservation({ id: 1 }), createSampleReservation({ id: 2 })],
        meta: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      }),
    });

    const useCase = new ListReservationsUseCase(repository);
    const result = await useCase.execute({ page: 1, limit: 10 });

    expect(result.data).toHaveLength(2);
    expect(result.meta.total).toBe(2);
  });
});
