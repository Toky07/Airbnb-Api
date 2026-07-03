import type { EntityType } from '../../constant';
import { Media } from '../entities/media.entity';

export interface IMediaRepository {
  findByEntity(entityType: EntityType, entityId: number): Promise<Media[]>;
  findOneByEntity(
    entityType: EntityType,
    entityId: number,
  ): Promise<Media | null>;
  create(media: Media): Promise<Media>;
  delete(id: number): Promise<boolean>;
  deleteByEntity(entityType: EntityType, entityId: number): Promise<Media[]>;
}
