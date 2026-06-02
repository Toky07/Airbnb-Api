export type CreatePropertyDto = {
    name: string;
    description: string;
    address: string;
    city: string;
    country: string;
    latitude: number;
    longitude: number;
    checkInTime: string;
    checkOutTime: string;
    ownerId: number;
    createdAt?: Date;
    updatedAt?: Date;
    id?: number;
}
