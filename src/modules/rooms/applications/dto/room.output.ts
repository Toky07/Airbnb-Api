import type { AmenityOutput } from '@src/modules/amenity/contracts';
import {
  toPropertySummary,
  type PropertySummary,
} from '@src/modules/properties/contracts/property-summary';
import type { CategorySummary } from '@src/shared/types/category-summary';
import { Room } from '@src/modules/rooms/domain/entities/room.entity';

export type UnavailableDateRange = {
  startDate: string;
  endDate: string;
};

export class RoomOutput {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly slug: string,
    public readonly description: string,
    public readonly pricePerNight: number,
    public readonly weekendPricePerNight: number | null,
    public readonly maxGuests: number,
    public readonly bedrooms: number,
    public readonly bathrooms: number,
    public readonly beds: number,
    public readonly quantity: number,
    public readonly size: number,
    public readonly status: string,
    public readonly roomTypeId: number | null,
    public readonly roomType: CategorySummary | null,
    public readonly property: PropertySummary,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly images: string[],
    public readonly unavailableDates?: UnavailableDateRange[],
    public readonly amenities: AmenityOutput[] = [],
    public readonly propertyAmenities: AmenityOutput[] = [],
  ) {}

  public static fromDomain(
    room: Room,
    images: string[] = [],
    unavailableDates?: UnavailableDateRange[],
    amenities: AmenityOutput[] = [],
    propertyAmenities: AmenityOutput[] = [],
    omitOwnerId = false,
  ): RoomOutput {
    return new RoomOutput(
      room.id!,
      room.name,
      room.slug,
      room.description,
      room.pricePerNight,
      room.weekendPricePerNight,
      room.maxGuests,
      room.bedrooms,
      room.bathrooms,
      room.beds,
      room.quantity,
      room.size,
      room.status,
      room.roomTypeId,
      room.roomType,
      toPropertySummary(room.property, { omitOwnerId }),
      room.createdAt!,
      room.updatedAt!,
      images,
      unavailableDates,
      amenities,
      propertyAmenities,
    );
  }
}
