import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ListHostBookingOrdersQueryHandler } from './ListHostBookingOrdersQueryHandler';
import { ListHostBookingOrdersQuery } from '@src/modules/reservation/applications/useCase/queries/ListHostBookingOrdersQuery';

describe('ListHostBookingOrdersQueryHandler', () => {
  const paymentRepository = { findPaginatedForReservationIds: vi.fn() };
  const reservationRepository = { findIdsByPropertyIds: vi.fn() };
  const resolveHostPropertyIds = { resolve: vi.fn() };
  const listBookingOrdersQueryHandler = { buildPage: vi.fn() };

  let handler: ListHostBookingOrdersQueryHandler;

  beforeEach(() => {
    vi.clearAllMocks();
    resolveHostPropertyIds.resolve.mockResolvedValue([1]);
    reservationRepository.findIdsByPropertyIds.mockResolvedValue([10]);
    paymentRepository.findPaginatedForReservationIds.mockResolvedValue({
      data: [{ id: 7 }],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });
    listBookingOrdersQueryHandler.buildPage.mockResolvedValue({
      data: [{ paymentId: 7, itemCount: 1 }],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });
    handler = new ListHostBookingOrdersQueryHandler(
      paymentRepository as never,
      reservationRepository as never,
      resolveHostPropertyIds as never,
      listBookingOrdersQueryHandler as never,
    );
  });

  it('filtre les commandes par établissements du host', async () => {
    await handler.execute(
      new ListHostBookingOrdersQuery(42, { page: 1, limit: 10 }),
    );

    expect(resolveHostPropertyIds.resolve).toHaveBeenCalledWith(42, undefined);
    expect(listBookingOrdersQueryHandler.buildPage).toHaveBeenCalledWith(
      expect.anything(),
      { propertyIds: [1] },
    );
  });

  it('retourne une page vide sans établissement', async () => {
    resolveHostPropertyIds.resolve.mockResolvedValue([]);

    const result = await handler.execute(
      new ListHostBookingOrdersQuery(42, { page: 1, limit: 10 }),
    );

    expect(result.data).toEqual([]);
    expect(
      paymentRepository.findPaginatedForReservationIds,
    ).not.toHaveBeenCalled();
  });
});
