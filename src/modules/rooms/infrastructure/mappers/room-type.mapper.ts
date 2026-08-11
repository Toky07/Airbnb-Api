import { RoomType } from '@src/modules/rooms/domain/entities/room-type.entity';
import { RoomTypeEntity } from '@src/modules/rooms/infrastructure/entities/room-type.entity';

export class RoomTypeMapper {
  static toDomain(entity: RoomTypeEntity): RoomType {
    return new RoomType(
      entity.name,
      entity.slug,
      entity.sortOrder,
      entity.isActive,
      entity.id,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static toEntity(domain: RoomType): Partial<RoomTypeEntity> {
    return {
      id: domain.id,
      name: domain.name,
      slug: domain.slug,
      sortOrder: domain.sortOrder,
      isActive: domain.isActive,
    };
  }
}
