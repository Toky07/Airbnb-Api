import type { ReservationStatus } from '../../domain/constants/reservation-status.constant';
import type { Reservation } from '../../domain/entities/reservation.entity';

export class ReservationOutput {
  constructor(
    public readonly id: number,
    public readonly roomId: number,
    public readonly userId: number,
    public readonly startDate: string,
    public readonly endDate: string,
    public readonly guestCount: number,
    public readonly totalPrice: number,
    public readonly nights: number,
    public readonly status: ReservationStatus,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static fromDomain(reservation: Reservation): ReservationOutput {
    return new ReservationOutput(
      reservation.id!,
      reservation.roomId,
      reservation.userId,
      reservation.startDate,
      reservation.endDate,
      reservation.guestCount,
      reservation.totalPrice,
      reservation.nights,
      reservation.status,
      reservation.createdAt!,
      reservation.updatedAt!,
    );
  }
}
