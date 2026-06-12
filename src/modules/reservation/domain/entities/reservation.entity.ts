import type { ReservationItem } from './reservation-item.entity';

export class Reservation {
  constructor(
    public readonly userId: number,
    public readonly items: ReservationItem[],
    public readonly id?: number,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
