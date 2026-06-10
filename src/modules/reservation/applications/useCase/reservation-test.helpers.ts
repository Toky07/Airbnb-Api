import { vi } from 'vitest';
import { RESERVATION_STATUS } from '../../domain/constants/reservation-status.constant';
import { Reservation } from '../../domain/entities/reservation.entity';
import type { IReservationRepository } from '../../domain/repositories/reservation.repository';

export function createSampleReservation(
  overrides: Partial<{
    id: number;
    roomId: number;
    userId: number;
    status: (typeof RESERVATION_STATUS)[keyof typeof RESERVATION_STATUS];
    startDate: string;
    endDate: string;
    totalPrice: number;
  }> = {},
): Reservation {
  return new Reservation(
    overrides.roomId ?? 10,
    overrides.userId ?? 5,
    overrides.startDate ?? '2026-07-01',
    overrides.endDate ?? '2026-07-03',
    2,
    overrides.totalPrice ?? 240,
    2,
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
        roomId: reservation.roomId,
        userId: reservation.userId,
        status: reservation.status,
        startDate: reservation.startDate,
        endDate: reservation.endDate,
      }),
    ),
    update: vi.fn().mockImplementation(async (reservation: Reservation) => reservation),
    findById: vi.fn(),
    findPaginated: vi.fn(),
    findOverlapping: vi.fn().mockResolvedValue([]),
    ...overrides,
  } as unknown as IReservationRepository;
}
