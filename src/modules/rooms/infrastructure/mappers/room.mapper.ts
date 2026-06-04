import { Property } from "../../../properties/domain/entities/property.entity";
import { PropertyMapper } from "../../../properties/infrastructure/mappers/property.mapper";
import { Room } from "../../domain/entities/room.entity";
import { RoomEntity } from "../entities/room.entity";

function mapRoomProperty(room: RoomEntity): Property {
    if (room.property?.id != null) {
        return PropertyMapper.toDomain(room.property);
    }

    return new Property({
        name: '',
        description: '',
        address: '',
        city: '',
        country: '',
        latitude: 0,
        longitude: 0,
        checkInTime: '',
        checkOutTime: '',
        ownerId: 0,
    });
}

export class RoomMapper {
    static toDomain(room: RoomEntity): Room {
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
            property: mapRoomProperty(room),
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
            ...(room.property?.id
                ? { property: { id: room.property.id } as RoomEntity['property'] }
                : {}),
        } as RoomEntity;
    }
}