import type { CategorySummary } from '../../../../shared/types/category-summary';
import {
  DEFAULT_CANCELLATION_POLICY,
  parseCancellationPolicy,
} from '../../../reservation/contracts/cancellation-policy';
import { Property } from '../../domain/entities/property.entity';
import { RoomMapper } from '../../../rooms/infrastructure/mappers/room.mapper';
import { RoomEntity } from '../../../rooms/infrastructure/entities/room.entity';
import { PropertyEntity } from '../entities/property-entity.entity';

function mapPropertyType(entity: PropertyEntity): CategorySummary | null {
  if (!entity.propertyType) {
    return null;
  }
  return {
    id: entity.propertyType.id,
    name: entity.propertyType.name,
    slug: entity.propertyType.slug,
  };
}

export class PropertyMapper {
  static toDomain(property: PropertyEntity): Property {
    return new Property({
      ...PropertyMapper.toDomainFields(property),
      rooms:
        property.rooms?.map((r: RoomEntity) => RoomMapper.toDomain(r)) || [],
    });
  }

  /** Évite la récursion Property ↔ Room lors du mapping inverse. */
  static toDomainWithoutRooms(property: PropertyEntity): Property {
    return new Property({
      ...PropertyMapper.toDomainFields(property),
      rooms: [],
    });
  }

  private static toDomainFields(property: PropertyEntity) {
    return {
      name: property.name,
      description: property.description,
      address: property.address,
      city: property.city,
      country: property.country,
      latitude: property.latitude,
      longitude: property.longitude,
      checkInTime: property.checkInTime,
      checkOutTime: property.checkOutTime,
      cancellationPolicy:
        parseCancellationPolicy(property.cancellationPolicy) ??
        DEFAULT_CANCELLATION_POLICY,
      touristTaxPerGuestNight: Number(property.touristTaxPerGuestNight ?? 0),
      ownerId: property.ownerId,
      propertyTypeId: property.propertyTypeId,
      propertyType: mapPropertyType(property),
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
      id: property.id,
    };
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
