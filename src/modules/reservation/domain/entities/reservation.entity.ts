import type { ReservationStatus } from '../constants/reservation-status.constant';

export class Reservation {
  constructor(
    public readonly roomId: number,
    public readonly userId: number,
    public readonly startDate: string,
    public readonly endDate: string,
    public readonly guestCount: number,
    public readonly totalPrice: number,
    public readonly nights: number,
    public readonly status: ReservationStatus,
    public readonly id?: number,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
