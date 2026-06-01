import { CreatePropertyDto } from "../../applications/dto/createProperty.dto";

export class Property {
    public name: string;
    public description: string;
    public type: string;
    public address: string;
    public city: string;
    public country: string;
    public latitude: number;
    public longitude: number;
    public checkInTime: string;
    public checkOutTime: string;
    public ownerId: number;
    public id?: number;
    public createdAt?: Date;
    public updatedAt?: Date;

    constructor({
        name,
        description,
        type,
        address,
        city,
        country,
        latitude,
        longitude,
        checkInTime,
        checkOutTime,
        ownerId,
        id,
        createdAt,
        updatedAt,
    }: CreatePropertyDto & { id?: number, createdAt?: Date, updatedAt?: Date }) {
        this.name = name;
        this.description = description;
        this.type = type;
        this.address = address;
        this.city = city;
        this.country = country;
        this.latitude = latitude;
        this.longitude = longitude;
        this.checkInTime = checkInTime;
        this.checkOutTime = checkOutTime;
        this.ownerId = ownerId;
        this.id = id;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}
