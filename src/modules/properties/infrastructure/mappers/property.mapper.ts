import { CreatePropertyDto } from "../../applications/dto/createProperty.dto";
import { Property } from "../../domain/entities/property.entity";

export class PropertyMapper {
    static toDomain(property: any): Property {
        return new Property({
            name: property.name,
            description: property.description,
            address: property.address,
            city: property.city,
            country: property.country,
            latitude: property.latitude,
            longitude: property.longitude,
            checkInTime: property.checkInTime,
            checkOutTime: property.checkOutTime,
            ownerId: property.ownerId,
            createdAt: property.createdAt,
            updatedAt: property.updatedAt,
            id: property.id,
        } as CreatePropertyDto);
    }

    static toEntity(property: Property): any {
        return {
            id: property.id,
            name: property.name,
            description: property.description,
            address: property.address,
            city: property.city,
            country: property.country,
            latitude: property.latitude,
            longitude: property.longitude,
            checkInTime: property.checkInTime,
            checkOutTime: property.checkOutTime,
            ownerId: property.ownerId,
            createdAt: property.createdAt,
            updatedAt: property.updatedAt,
        };
    }
}