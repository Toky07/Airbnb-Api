import { Property } from "../../../properties/domain/entities/property.entity";

export type CreateRoomDto = {
    name: string;
    description: string;
    pricePerNight: number;
    maxGuests: number;
    bedrooms: number;
    bathrooms: number;
    beds: number;
    quantity: number;
    size: number;
    status: string;
    property: Property;
    roomTypeId?: number | null;
    id?: number;
    createdAt?: Date;
    updatedAt?: Date;
}
