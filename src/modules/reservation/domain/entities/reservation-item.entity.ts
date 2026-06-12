import type { ReservationStatus } from '../constants/reservation-status.constant';

export class ReservationItem {
  constructor(
    public readonly reservationId: number,
    public readonly roomId: number,
    public readonly checkIn: string,
    public readonly checkOut: string,
    public readonly guestCount: number,
    public readonly price: number,
    public readonly nights: number,
    public readonly status: ReservationStatus,
    public readonly id?: number,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
