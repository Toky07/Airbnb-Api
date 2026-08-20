import { Property } from '@src/modules/properties/domain/entities/property.entity';
import { toPropertySummary } from '@src/modules/properties/contracts/property-summary';
import type { CategorySummary } from '@src/shared/types/category-summary';
import { Room } from '@src/modules/rooms/domain/entities/room.entity';
import { RoomEntity } from '@src/modules/rooms/infrastructure/entities/room.entity';

function mapRoomType(entity: RoomEntity): CategorySummary | null {
  if (!entity.roomType) {
    return null;
  }
  return {
    id: entity.roomType.id,
    name: entity.roomType.name,
    slug: entity.roomType.slug,
  };
}

function mapRoomProperty(room: RoomEntity): Property {
  if (room.property?.id != null) {
    return new Property({
      ...toPropertySummary(room.property),
      checkInInstructions: room.property.checkInInstructions ?? '',
      wifiName: room.property.wifiName ?? '',
      wifiPassword: room.property.wifiPassword ?? '',
      rooms: [],
    });
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
      slug: room.slug,
      description: room.description,
      pricePerNight: room.pricePerNight,
      weekendPricePerNight: room.weekendPricePerNight,
      maxGuests: room.maxGuests,
      bedrooms: room.bedrooms,
      bathrooms: room.bathrooms,
      beds: room.beds,
      quantity: room.quantity,
      size: room.size,
      status: room.status,
      property: mapRoomProperty(room),
      roomTypeId: room.roomTypeId,
      roomType: mapRoomType(room),
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
      id: room.id,
    });
  }

  static toEntity(room: Room): Partial<RoomEntity> {
    return {
      name: room.name,
      slug: room.slug,
      description: room.description,
      pricePerNight: room.pricePerNight,
      weekendPricePerNight: room.weekendPricePerNight,
      maxGuests: room.maxGuests,
      bedrooms: room.bedrooms,
      bathrooms: room.bathrooms,
      beds: room.beds,
      quantity: room.quantity,
      size: room.size,
      status: room.status,
      roomTypeId: room.roomTypeId,
      ...(room.property?.id
        ? { property: { id: room.property.id } as RoomEntity['property'] }
        : {}),
    };
  }
}
