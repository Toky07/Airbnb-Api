import { Amenity } from '@src/modules/amenity/domain/entities/amenity.entity';
import { AmenityOrmEntity } from '@src/modules/amenity/infrastructure/entities/amenity.orm-entity';

export class AmenityMapper {
  static toDomain(entity: AmenityOrmEntity): Amenity {
    return new Amenity(
      entity.name,
      entity.icon,
      entity.scope,
      entity.isActive,
      entity.id,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static toEntity(domain: Amenity): Partial<AmenityOrmEntity> {
    return {
      id: domain.id,
      name: domain.name,
      icon: domain.icon,
      scope: domain.scope,
      isActive: domain.isActive,
    };
  }
}
