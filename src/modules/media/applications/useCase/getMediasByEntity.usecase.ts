import { Inject } from '@nestjs/common';
import type { EntityType } from '../../constant';
import { Media } from '../../domain/entities/media.entity';
import type { IMediaRepository } from '../../domain/repositories/media.repository';
import { MEDIA_REPOSITORY } from '../../infrastructure/repositories/media.repository';

export class GetMediasByEntityUseCase {
  constructor(
    @Inject(MEDIA_REPOSITORY) private readonly repository: IMediaRepository,
  ) {}

  async execute(entityType: EntityType, entityId: number): Promise<Media[]> {
    return this.repository.findByEntity(entityType, entityId);
  }
}
