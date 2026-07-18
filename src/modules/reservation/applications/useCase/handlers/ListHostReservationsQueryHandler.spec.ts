import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buildPaginationMeta } from '../../../../../shared/pagination/pagination.types';
import { RESERVATION_STATUS } from '../../../domain/constants/reservation-status.constant';
import { ReservationOutput } from '../../dto/reservation.output';
import { ListHostReservationsQueryHandler } from './ListHostReservationsQueryHandler';
import { ListHostReservationsQuery } from '../queries/ListHostReservationsQuery';
import { ListReservationsQuery } from '../queries/ListReservationsQuery';

describe('ListHostReservationsQueryHandler', () => {
  const resolveHostPropertyIds = { resolve: vi.fn() };
  const listReservationsQueryHandler = { execute: vi.fn() };

  let handler: ListHostReservationsQueryHandler;

  beforeEach(() => {
    vi.clearAllMocks();
    resolveHostPropertyIds.resolve.mockResolvedValue([1, 2]);
    listReservationsQueryHandler.execute.mockResolvedValue({
      data: [
        new ReservationOutput(
          1,
          1,
          [],
          RESERVATION_STATUS.CONFIRMED,
          new Date('2026-07-02'),
          new Date('2026-07-02'),
        ),
      ],
      meta: buildPaginationMeta(1, 1, 10),
    });
    handler = new ListHostReservationsQueryHandler(
      resolveHostPropertyIds as never,
      listReservationsQueryHandler as never,
    );
  });

  it('delegates to list reservations with host property ids', async () => {
    await handler.execute(
      new ListHostReservationsQuery(42, { page: 1, limit: 10, propertyId: 1 }),
    );

    expect(resolveHostPropertyIds.resolve).toHaveBeenCalledWith(42, 1);
    expect(listReservationsQueryHandler.execute).toHaveBeenCalledWith(
      expect.any(ListReservationsQuery),
    );
    const query = listReservationsQueryHandler.execute.mock.calls[0]?.[0];
    expect(query.params.propertyIds).toEqual([1, 2]);
  });

  it('returns empty page when host has no properties', async () => {
    resolveHostPropertyIds.resolve.mockResolvedValue([]);

    const result = await handler.execute(
      new ListHostReservationsQuery(42, { page: 1, limit: 10 }),
    );

    expect(result.data).toEqual([]);
    expect(result.meta.total).toBe(0);
    expect(listReservationsQueryHandler.execute).not.toHaveBeenCalled();
  });
});
