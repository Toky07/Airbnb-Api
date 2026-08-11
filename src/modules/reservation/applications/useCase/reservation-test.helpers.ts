import { vi } from 'vitest';
import { RESERVATION_STATUS } from '@src/modules/reservation/domain/constants/reservation-status.constant';
import { ReservationItem } from '@src/modules/reservation/domain/entities/reservation-item.entity';
import { Reservation } from '@src/modules/reservation/domain/entities/reservation.entity';
import type { IReservationRepository } from '@src/modules/reservation/domain/repositories/reservation.repository';
import { Payment } from '@src/modules/payment/contracts';

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
    payment: Payment;
    status: (typeof RESERVATION_STATUS)[keyof typeof RESERVATION_STATUS];
    items: ReservationItem[];
    holdUntil: Date | null;
  }> = {},
): Reservation {
  const item = createSampleReservationItem({
    reservationId: overrides.id ?? 1,
  });

  return new Reservation(
    overrides.userId ?? 5,
    overrides.items ?? [item],
    overrides.status ?? RESERVATION_STATUS.PENDING,
    1,
    overrides.id ?? 1,
    new Date('2026-06-01T10:00:00.000Z'),
    new Date('2026-06-01T10:00:00.000Z'),
    overrides.holdUntil === undefined
      ? new Date('2026-06-01T10:20:00.000Z')
      : overrides.holdUntil,
  );
}

export function createReservationRepositoryMock(
  overrides: Partial<IReservationRepository> = {},
): IReservationRepository {
  return {
    createWithHold: vi
      .fn()
      .mockImplementation(async (reservation: Reservation) =>
        createSampleReservation({
          id: 1,
          userId: reservation.userId,
          items: reservation.items,
          holdUntil:
            reservation.holdUntil ?? new Date('2026-06-01T10:20:00.000Z'),
        }),
      ),
    findById: vi.fn(),
    findPaginated: vi.fn(),
    findOverlapping: vi.fn().mockResolvedValue([]),
    countByScope: vi.fn(),
    sumConfirmedRevenueForMonth: vi.fn(),
    sumConfirmedNightsForMonth: vi.fn(),
    findRecentItems: vi.fn(),
    findByIds: vi.fn(),
    findIdsByPropertyIds: vi.fn(),
    findByPaymentId: vi.fn(),
    clearExpiredReservations: vi.fn(),
    update: vi.fn(),
    setPayment: vi.fn(),
    ...overrides,
  };
}
