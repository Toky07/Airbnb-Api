import type { EntityType, MediaType } from '../../constant';
import { Media } from '../../domain/entities/media.entity';
import { MediaOrmEntity } from '../entities/media-orm.entity';

export class MediaMapper {
  static toDomain(entity: MediaOrmEntity): Media {
    return new Media(
      entity.path,
      entity.type as MediaType,
      entity.entityType as EntityType,
      entity.entityId,
      entity.id,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static toEntity(media: Media): Partial<MediaOrmEntity> {
    return {
      id: media.id,
      path: media.path,
      type: media.type,
      entityType: media.entityType,
      entityId: media.entityId,
    };
  }
}
