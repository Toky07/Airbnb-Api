import { Inject } from '@nestjs/common';
import {
  ENTITY_MEDIA_LIMITS,
  MEDIA_TYPE,
  type EntityType,
  type MediaType,
} from '../../constant';
import { Media } from '../../domain/entities/media.entity';
import type { IMediaRepository } from '../../domain/repositories/media.repository';
import { MEDIA_REPOSITORY } from '../../infrastructure/repositories/media.repository';
import {
  LOCAL_STORAGE_SERVICE,
  type ILocalStorageService,
} from '../../services/localStorage.service';
import type { UploadFile } from '../../types/upload-file';
import { DeleteMediasByEntityUseCase } from './deleteMediasByEntity.usecase';

export class SaveEntityMediasUseCase {
  constructor(
    @Inject(MEDIA_REPOSITORY) private readonly repository: IMediaRepository,
    @Inject(LOCAL_STORAGE_SERVICE) private readonly storage: ILocalStorageService,
    private readonly deleteMediasByEntity: DeleteMediasByEntityUseCase,
  ) {}

  async execute(
    entityType: EntityType,
    entityId: number,
    files: UploadFile[],
    mediaType: MediaType = MEDIA_TYPE.IMAGE,
  ): Promise<Media[]> {
    if (files.length === 0) {
      return [];
    }

    const maxFiles = ENTITY_MEDIA_LIMITS[entityType];
    if (files.length > maxFiles) {
      throw new Error(
        `Maximum ${maxFiles} media file(s) allowed for entity type "${entityType}"`,
      );
    }

    await this.deleteMediasByEntity.execute(entityType, entityId);

    const saved: Media[] = [];
    for (const file of files) {
      const path = await this.storage.save(file, entityType, entityId);
      const media = await this.repository.create(
        new Media(path, mediaType, entityType, entityId),
      );
      saved.push(media);
    }

    return saved;
  }
}
