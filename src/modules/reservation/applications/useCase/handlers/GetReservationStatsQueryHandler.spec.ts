import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GetReservationStatsQueryHandler } from './GetReservationStatsQueryHandler';
import { GetReservationStatsQuery } from '../queries/GetReservationStatsQuery';
import { RESERVATION_STATUS } from '../../../domain/constants/reservation-status.constant';

describe('GetReservationStatsQueryHandler', () => {
  const reservationRepository = {
    countByScope: vi.fn(),
    sumConfirmedRevenueForMonth: vi.fn(),
    sumConfirmedNightsForMonth: vi.fn(),
    findRecentItems: vi.fn(),
  };
  const resolveStatsScope = { resolve: vi.fn() };
  const countScopedRooms = { count: vi.fn() };
  const enrichReservationOutputs = { enrichItems: vi.fn() };

  let handler: GetReservationStatsQueryHandler;

  beforeEach(() => {
    vi.clearAllMocks();
    resolveStatsScope.resolve.mockResolvedValue({ propertyIds: [1] });
    reservationRepository.countByScope.mockImplementation(async (_scope, status) => {
      if (status === RESERVATION_STATUS.CONFIRMED) return 2;
      if (status === RESERVATION_STATUS.PENDING) return 1;
      return 3;
    });
    reservationRepository.sumConfirmedRevenueForMonth.mockResolvedValue(500);
    reservationRepository.sumConfirmedNightsForMonth.mockResolvedValue(10);
    reservationRepository.findRecentItems.mockResolvedValue([]);
    countScopedRooms.count.mockResolvedValue(5);
    enrichReservationOutputs.enrichItems.mockResolvedValue([]);
    handler = new GetReservationStatsQueryHandler(
      reservationRepository as never,
      resolveStatsScope as never,
      countScopedRooms as never,
      enrichReservationOutputs as never,
    );
  });

  it('agrège les statistiques host', async () => {
    const result = await handler.execute(
      new GetReservationStatsQuery(42, { canReadAll: false, canReadHost: true }),
    );

    expect(result.activeCount).toBe(2);
    expect(result.pendingCount).toBe(1);
    expect(result.totalCount).toBe(3);
    expect(result.monthlyRevenue).toBe(500);
    expect(result.recentActivity).toEqual([]);
  });
});
