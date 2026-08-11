import type { ReservationStatus } from '@src/modules/reservation/domain/constants/reservation-status.constant';
import type { ReservationItemOutput } from './reservation-item.output';

export class BookingOrderItemOutput {
  constructor(
    public readonly id: number,
    public readonly reservationId: number,
    public readonly roomId: number,
    public readonly userId: number,
    public readonly checkIn: string,
    public readonly checkOut: string,
    public readonly startDate: string,
    public readonly endDate: string,
    public readonly guestCount: number,
    public readonly price: number,
    public readonly nights: number,
    public readonly status: ReservationStatus,
    public readonly roomName: string | null,
    public readonly roomSlug: string | null,
    public readonly propertyId: number | null,
    public readonly propertyName: string | null,
    public readonly propertyCity: string | null,
    public readonly imageUrl: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static fromReservationItem(
    item: ReservationItemOutput,
    context: { userId: number; status: ReservationStatus },
  ): BookingOrderItemOutput {
    return new BookingOrderItemOutput(
      item.id,
      item.reservationId,
      item.roomId,
      context.userId,
      item.checkIn,
      item.checkOut,
      item.startDate,
      item.endDate,
      item.guestCount,
      item.price,
      item.nights,
      context.status,
      item.roomName,
      item.roomSlug,
      item.propertyId,
      item.propertyName,
      item.propertyCity,
      item.imageUrl,
      item.createdAt,
      item.updatedAt,
    );
  }
}
