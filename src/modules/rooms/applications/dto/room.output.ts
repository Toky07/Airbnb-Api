import { Property } from "src/modules/properties/domain/entities/property.entity";
import type { CategorySummary } from "../../../../shared/types/category-summary";
import { Room } from "../../domain/entities/room.entity";

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
        public readonly maxGuests: number,
        public readonly bedrooms: number,
        public readonly bathrooms: number,
        public readonly beds: number,
        public readonly quantity: number,
        public readonly size: number,
        public readonly status: string,
        public readonly roomTypeId: number | null,
        public readonly roomType: CategorySummary | null,
        public readonly property: Property,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
        public readonly images: string[],
        public readonly unavailableDates?: UnavailableDateRange[],
    ) {}

    public static fromDomain(
        room: Room,
        images: string[] = [],
        unavailableDates?: UnavailableDateRange[],
    ): RoomOutput {
        return new RoomOutput(
            room.id!,
            room.name,
            room.slug,
            room.description,
            room.pricePerNight,
            room.maxGuests,
            room.bedrooms,
            room.bathrooms,
            room.beds,
            room.quantity,
            room.size,
            room.status,
            room.roomTypeId,
            room.roomType,
            room.property,
            room.createdAt!,
            room.updatedAt!,
            images,
            unavailableDates,
        );
    }
}
