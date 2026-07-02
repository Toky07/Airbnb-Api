import { describe, expect, it, vi } from 'vitest';
import { ListReservationsQueryHandler } from './ListReservationsQueryHandler';
import { ListReservationsQuery } from '../queries/ListReservationsQuery';
import {
  createReservationRepositoryMock,
  createSampleReservation,
} from '../reservation-test.helpers';

describe('ListReservationsQueryHandler', () => {
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
    const enrichReservationOutputs = {
      enrich: vi.fn().mockImplementation(async (outputs: unknown[]) => outputs),
    };

    const handler = new ListReservationsQueryHandler(
      repository,
      enrichReservationOutputs as never,
    );
    const result = await handler.execute(new ListReservationsQuery({ page: 1, limit: 10 }));

    expect(result.data).toHaveLength(2);
    expect(result.meta.total).toBe(2);
  });
});
