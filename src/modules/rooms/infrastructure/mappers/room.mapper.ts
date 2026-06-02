import { Room } from "../../domain/entities/room.entity";
import { RoomEntity } from "../entities/room.entity";

export class RoomMapper {
    static toDomain(room: any): Room {
        return new Room({
            name: room.name,
            description: room.description,
            pricePerNight: room.pricePerNight,
            maxGuests: room.maxGuests,
            bedrooms: room.bedrooms,
            bathrooms: room.bathrooms,
            beds: room.beds,
            quantity: room.quantity,
            size: room.size,
            status: room.status,
            propertyId: room.propertyId,
            createdAt: room.createdAt,
            updatedAt: room.updatedAt,
            id: room.id,
        });
    }

    static toEntity(room: Room): RoomEntity {
        return {
            name: room.name,
            description: room.description,
            pricePerNight: room.pricePerNight,
            maxGuests: room.maxGuests,
            bedrooms: room.bedrooms,
            bathrooms: room.bathrooms,
            beds: room.beds,
            quantity: room.quantity,
            size: room.size,
            status: room.status,
            propertyId: room.propertyId,
        } as RoomEntity;
    }
}