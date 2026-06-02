import { Property } from "src/modules/properties/domain/entities/property.entity";
import { Room } from "../../domain/entities/room.entity";

export class RoomOutput {
    constructor(
        public readonly id: number,
        public readonly name: string,
        public readonly description: string,
        public readonly pricePerNight: number,
        public readonly maxGuests: number,
        public readonly bedrooms: number,
        public readonly bathrooms: number,
        public readonly beds: number,
        public readonly quantity: number,
        public readonly size: number,
        public readonly status: string,
        public readonly property: Property,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
    ) {}

    public static fromDomain(room: Room): RoomOutput {
        return new RoomOutput(
            room.id!,
            room.name,
            room.description,
            room.pricePerNight,
            room.maxGuests,
            room.bedrooms,
            room.bathrooms,
            room.beds,
            room.quantity,
            room.size,
            room.status,
            room.property,
            room.createdAt!,
            room.updatedAt!,
        );
    }
}
