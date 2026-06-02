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
    propertyId: number;
    id?: number;
    createdAt?: Date;
    updatedAt?: Date;
}
