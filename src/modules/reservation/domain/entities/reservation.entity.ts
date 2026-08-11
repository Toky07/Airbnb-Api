import { ReservationStatus } from '@src/modules/reservation/domain/constants/reservation-status.constant';
import type { ReservationItem } from './reservation-item.entity';

export class Reservation {
  constructor(
    public readonly userId: number,
    public readonly items: ReservationItem[],
    public readonly status: ReservationStatus,
    public paymentId?: number | null,
    public readonly id?: number,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
    public readonly holdUntil?: Date | null,
  ) {}
}
