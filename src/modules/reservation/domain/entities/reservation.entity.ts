import { ReservationStatus } from '../constants/reservation-status.constant';
import type { ReservationItem } from './reservation-item.entity';
import type { Payment } from '../../../payment/domain/entities/payment.entity';

export class Reservation {
  constructor(
    public readonly userId: number,
    public readonly items: ReservationItem[],
    public readonly status: ReservationStatus,
    public readonly payment?: Payment,
    public readonly id?: number,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
