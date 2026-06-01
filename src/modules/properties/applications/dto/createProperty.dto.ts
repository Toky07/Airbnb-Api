export type CreatePropertyDto = {
    name: string;
    description: string;
    type: string;
    address: string;
    city: string;
    country: string;
    latitude: number;
    longitude: number;
    checkInTime: string;
    checkOutTime: string;
    ownerId: number;
}
