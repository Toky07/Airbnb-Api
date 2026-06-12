import { vi } from 'vitest';
import { RESERVATION_STATUS } from '../../domain/constants/reservation-status.constant';
import { ReservationItem } from '../../domain/entities/reservation-item.entity';
import { Reservation } from '../../domain/entities/reservation.entity';
import type { IReservationRepository } from '../../domain/repositories/reservation.repository';

export function createSampleReservationItem(
  overrides: Partial<{
    id: number;
    reservationId: number;
    roomId: number;
    status: (typeof RESERVATION_STATUS)[keyof typeof RESERVATION_STATUS];
    checkIn: string;
    checkOut: string;
    price: number;
  }> = {},
): ReservationItem {
  return new ReservationItem(
    overrides.reservationId ?? 1,
    overrides.roomId ?? 10,
    overrides.checkIn ?? '2026-07-01',
    overrides.checkOut ?? '2026-07-03',
    2,
    overrides.price ?? 240,
    2,
    overrides.id ?? 1,
    new Date('2026-06-01T10:00:00.000Z'),
    new Date('2026-06-01T10:00:00.000Z'),
  );
}

export function createSampleReservation(
  overrides: Partial<{
    id: number;
    userId: number;
    status: (typeof RESERVATION_STATUS)[keyof typeof RESERVATION_STATUS];
    items: ReservationItem[];
  }> = {},
): Reservation {
  const item = createSampleReservationItem({
    reservationId: overrides.id ?? 1,
  });

  return new Reservation(
    overrides.userId ?? 5,
    overrides.items ?? [item],
    overrides.status ?? RESERVATION_STATUS.PENDING,
    overrides.id ?? 1,
    new Date('2026-06-01T10:00:00.000Z'),
    new Date('2026-06-01T10:00:00.000Z'),
  );
}

export function createReservationRepositoryMock(
  overrides: Partial<IReservationRepository> = {},
): IReservationRepository {
  return {
    create: vi.fn().mockImplementation(async (reservation: Reservation) =>
      createSampleReservation({
        id: 1,
        userId: reservation.userId,
        items: reservation.items,
      }),
    ),
    updateItem: vi.fn().mockImplementation(async (item: ReservationItem) => item),
    findById: vi.fn(),
    findItemById: vi.fn(),
    findItemsByIds: vi.fn(),
    findPaginated: vi.fn(),
    findOverlapping: vi.fn().mockResolvedValue([]),
    countByScope: vi.fn(),
    sumConfirmedRevenueForMonth: vi.fn(),
    sumConfirmedNightsForMonth: vi.fn(),
    findRecentItems: vi.fn(),
    findByIds: vi.fn(),
    findIdsByPropertyId: vi.fn(),
    findIdsByPropertyIds: vi.fn(),
    findIdsByFilters: vi.fn(),
    clearExpiredReservations: vi.fn(),
    ...overrides,
  } as unknown as IReservationRepository;
}
