import { PropertyType } from '../../domain/entities/property-type.entity';
import { PropertyTypeEntity } from '../entities/property-type.entity';

export class PropertyTypeMapper {
  static toDomain(entity: PropertyTypeEntity): PropertyType {
    return new PropertyType(
      entity.name,
      entity.slug,
      entity.sortOrder,
      entity.isActive,
      entity.id,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static toEntity(domain: PropertyType): Partial<PropertyTypeEntity> {
    return {
      id: domain.id,
      name: domain.name,
      slug: domain.slug,
      sortOrder: domain.sortOrder,
      isActive: domain.isActive,
    };
  }
}
