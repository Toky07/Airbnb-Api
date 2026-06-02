import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { EntityType } from '../../constant';
import { Media } from '../../domain/entities/media.entity';
import type { IMediaRepository } from '../../domain/repositories/media.repository';
import { MediaOrmEntity } from '../entities/media-orm.entity';
import { MediaMapper } from '../mappers/media.mapper';

export const MEDIA_REPOSITORY = 'MEDIA_REPOSITORY';

export class MediaRepository implements IMediaRepository {
  constructor(
    @InjectRepository(MediaOrmEntity)
    private readonly repository: Repository<MediaOrmEntity>,
  ) {}

  async findByEntity(entityType: EntityType, entityId: number): Promise<Media[]> {
    const rows = await this.repository.find({
      where: { entityType, entityId },
      order: { id: 'ASC' },
    });
    return rows.map(MediaMapper.toDomain);
  }

  async findOneByEntity(
    entityType: EntityType,
    entityId: number,
  ): Promise<Media | null> {
    const row = await this.repository.findOne({
      where: { entityType, entityId },
      order: { id: 'ASC' },
    });
    return row ? MediaMapper.toDomain(row) : null;
  }

  async create(media: Media): Promise<Media> {
    const data = this.repository.create(MediaMapper.toEntity(media));
    const saved = await this.repository.save(data);
    return MediaMapper.toDomain(saved);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }

  async deleteByEntity(
    entityType: EntityType,
    entityId: number,
  ): Promise<Media[]> {
    const existing = await this.findByEntity(entityType, entityId);
    if (existing.length > 0) {
      await this.repository.delete({ entityType, entityId });
    }
    return existing;
  }
}
