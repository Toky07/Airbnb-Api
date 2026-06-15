import { Room } from '../../../rooms/domain/entities/room.entity';
import { CreatePropertyDto } from '../../applications/dto/createProperty.dto';
import type { CategorySummary } from '../../../../shared/types/category-summary';
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
      propertyTypeId: property.propertyTypeId,
      propertyType: mapPropertyType(property),
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
      id: property.id,
      rooms: property.rooms?.map((r: RoomEntity) => RoomMapper.toDomain(r)) || [],
    } as CreatePropertyDto & {
      id?: number;
      createdAt?: Date;
      updatedAt?: Date;
      rooms?: Room[];
      propertyType?: CategorySummary | null;
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
      ownerId: property.ownerId,
      propertyTypeId: property.propertyTypeId,
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
    };
  }
}
