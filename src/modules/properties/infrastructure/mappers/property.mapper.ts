import { toPropertySummary } from '../../contracts/property-summary';
import { Property } from '../../domain/entities/property.entity';
import { RoomMapper } from '../../../rooms/infrastructure/mappers/room.mapper';
import { RoomEntity } from '../../../rooms/infrastructure/entities/room.entity';
import { PropertyEntity } from '../entities/property-entity.entity';

export class PropertyMapper {
  static toDomain(property: PropertyEntity): Property {
    return new Property({
      ...toPropertySummary(property),
      rooms:
        property.rooms?.map((r: RoomEntity) => RoomMapper.toDomain(r)) || [],
    });
  }

  /** Évite la récursion Property ↔ Room lors du mapping inverse. */
  static toDomainWithoutRooms(property: PropertyEntity): Property {
    return new Property({
      ...toPropertySummary(property),
      rooms: [],
    });
  }

  static toEntity(property: Property): Partial<PropertyEntity> {
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
      cancellationPolicy: property.cancellationPolicy,
      touristTaxPerGuestNight: property.touristTaxPerGuestNight,
      ownerId: property.ownerId,
      propertyTypeId: property.propertyTypeId,
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
    };
  }
}
