import type { RoomProductSummary } from '@src/modules/rooms/contracts';
import type { ReservationItem } from '@src/modules/reservation/domain/entities/reservation-item.entity';

export type ReservationArrivalGuide = {
  address: string | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  houseRules: string | null;
  checkInInstructions: string | null;
  wifiName: string | null;
  wifiPassword: string | null;
  emergencyContact: string | null;
};

function toArrivalGuide(
  summary: RoomProductSummary | null | undefined,
  includeSecrets: boolean,
): ReservationArrivalGuide | null {
  if (!summary) {
    return null;
  }

  const guide: ReservationArrivalGuide = {
    address: summary.propertyAddress,
    checkInTime: summary.checkInTime,
    checkOutTime: summary.checkOutTime,
    houseRules: summary.houseRules,
    checkInInstructions: includeSecrets ? summary.checkInInstructions : null,
    wifiName: includeSecrets ? summary.wifiName : null,
    wifiPassword: includeSecrets ? summary.wifiPassword : null,
    emergencyContact: summary.emergencyContact,
  };

  const hasContent = Object.values(guide).some((value) => Boolean(value));
  return hasContent ? guide : null;
}

export class ReservationItemOutput {
  constructor(
    public readonly id: number,
    public readonly reservationId: number,
    public readonly roomId: number,
    public readonly checkIn: string,
    public readonly checkOut: string,
    public readonly startDate: string,
    public readonly endDate: string,
    public readonly guestCount: number,
    public readonly price: number,
    public readonly nights: number,
    public readonly roomName: string | null = null,
    public readonly roomSlug: string | null = null,
    public readonly propertyId: number | null = null,
    public readonly propertyName: string | null = null,
    public readonly propertyCity: string | null = null,
    public readonly imageUrl: string | null = null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly arrivalGuide: ReservationArrivalGuide | null = null,
  ) {}

  static fromDomain(
    item: ReservationItem,
    product?: {
      roomName?: string | null;
      roomSlug?: string | null;
      propertyId?: number | null;
      propertyName?: string | null;
      propertyCity?: string | null;
      imageUrl?: string | null;
    },
  ): ReservationItemOutput {
    return new ReservationItemOutput(
      item.id!,
      item.reservationId,
      item.roomId,
      item.checkIn,
      item.checkOut,
      item.checkIn,
      item.checkOut,
      item.guestCount,
      item.price,
      item.nights,
      product?.roomName ?? null,
      product?.roomSlug ?? null,
      product?.propertyId ?? null,
      product?.propertyName ?? null,
      product?.propertyCity ?? null,
      product?.imageUrl ?? null,
      item.createdAt!,
      item.updatedAt!,
      null,
    );
  }

  static enrich(
    output: ReservationItemOutput,
    summary?: RoomProductSummary | null,
    includeSecrets = false,
  ): ReservationItemOutput {
    return new ReservationItemOutput(
      output.id,
      output.reservationId,
      output.roomId,
      output.checkIn,
      output.checkOut,
      output.startDate,
      output.endDate,
      output.guestCount,
      output.price,
      output.nights,
      summary?.roomName ?? output.roomName,
      summary?.roomSlug ?? output.roomSlug,
      summary?.propertyId ?? output.propertyId,
      summary?.propertyName ?? output.propertyName,
      summary?.propertyCity ?? output.propertyCity,
      summary?.imageUrl ?? output.imageUrl,
      output.createdAt,
      output.updatedAt,
      toArrivalGuide(summary, includeSecrets) ?? output.arrivalGuide,
    );
  }
}
