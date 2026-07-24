import { ReservationStatus } from '../../domain/constants/reservation-status.constant';
import type { Reservation } from '../../domain/entities/reservation.entity';
import { ReservationItemOutput } from './reservation-item.output';

export class ReservationOutput {
  constructor(
    public readonly id: number,
    public readonly userId: number,
    public readonly items: ReservationItemOutput[],
    public readonly status: ReservationStatus,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly holdUntil: Date | null = null,
    public readonly paymentId: number | null = null,
  ) {}

  get nights(): number {
    return this.items.reduce((sum, item) => sum + item.nights, 0);
  }

  static fromDomain(reservation: Reservation): ReservationOutput {
    return new ReservationOutput(
      reservation.id!,
      reservation.userId,
      reservation.items.map((item) => ReservationItemOutput.fromDomain(item)),
      reservation.status,
      reservation.createdAt!,
      reservation.updatedAt!,
      reservation.holdUntil ?? null,
      reservation.paymentId ?? null,
    );
  }
}
