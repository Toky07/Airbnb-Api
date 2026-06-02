import { Property } from "src/modules/properties/domain/entities/property.entity";

export class Room {
    public name: string;
    public description: string;
    public pricePerNight: number;
    public maxGuests: number;
    public bedrooms: number;
    public bathrooms: number;
    public beds: number;
    public quantity: number;
    public size: number;
    public status: string;
    public property: Property;
    public createdAt?: Date;
    public updatedAt?: Date;
    public id?: number;

    constructor({
        name,
        description,
        pricePerNight,
        maxGuests,
        bedrooms,
        bathrooms,
        beds,
        quantity,
        size,
        status,
        property,
        createdAt,
        updatedAt,
        id,
    }: {
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
        createdAt?: Date;
        updatedAt?: Date;
        id?: number;
    }) {
        this.name = name;
        this.description = description;
        this.pricePerNight = pricePerNight;
        this.maxGuests = maxGuests;
        this.bedrooms = bedrooms;
        this.bathrooms = bathrooms;
        this.beds = beds;
        this.quantity = quantity;
        this.size = size;
        this.status = status;
        this.property = property;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.id = id;
    }
}
