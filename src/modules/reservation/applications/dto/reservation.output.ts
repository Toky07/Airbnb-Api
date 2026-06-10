import type { RoomProductSummary } from '../../../rooms/applications/services/room-product-summary.service';
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
    public readonly roomName: string | null = null,
    public readonly propertyName: string | null = null,
    public readonly propertyCity: string | null = null,
    public readonly imageUrl: string | null = null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static fromDomain(
    reservation: Reservation,
    product?: {
      roomName?: string | null;
      propertyName?: string | null;
      propertyCity?: string | null;
      imageUrl?: string | null;
    },
  ): ReservationOutput {
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
      product?.roomName ?? null,
      product?.propertyName ?? null,
      product?.propertyCity ?? null,
      product?.imageUrl ?? null,
      reservation.createdAt!,
      reservation.updatedAt!,
    );
  }

  static enrich(
    output: ReservationOutput,
    summary?: RoomProductSummary | null,
  ): ReservationOutput {
    return new ReservationOutput(
      output.id,
      output.roomId,
      output.userId,
      output.startDate,
      output.endDate,
      output.guestCount,
      output.totalPrice,
      output.nights,
      output.status,
      summary?.roomName ?? null,
      summary?.propertyName ?? null,
      summary?.propertyCity ?? null,
      summary?.imageUrl ?? null,
      output.createdAt,
      output.updatedAt,
    );
  }
}
