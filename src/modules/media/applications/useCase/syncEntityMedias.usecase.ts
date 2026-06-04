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

export type SyncEntityMediasOptions = {
  keptPaths: string[];
  newFiles?: UploadFile[];
};

export class SyncEntityMediasUseCase {
  constructor(
    @Inject(MEDIA_REPOSITORY) private readonly repository: IMediaRepository,
    @Inject(LOCAL_STORAGE_SERVICE) private readonly storage: ILocalStorageService,
  ) {}

  async execute(
    entityType: EntityType,
    entityId: number,
    options: SyncEntityMediasOptions,
    mediaType: MediaType = MEDIA_TYPE.IMAGE,
  ): Promise<Media[]> {
    const newFiles = options.newFiles ?? [];
    const keptSet = new Set(options.keptPaths);
    const existing = await this.repository.findByEntity(entityType, entityId);

    for (const media of existing) {
      if (keptSet.has(media.path)) {
        continue;
      }
      if (media.id != null) {
        await this.repository.delete(media.id);
      }
      await this.storage.delete(media.path);
    }

    const remainingCount = existing.filter((media) => keptSet.has(media.path)).length;
    const maxFiles = ENTITY_MEDIA_LIMITS[entityType];
    const slotsLeft = maxFiles - remainingCount;

    if (newFiles.length > slotsLeft) {
      throw new Error(
        `Maximum ${maxFiles} media file(s) allowed for entity type "${entityType}"`,
      );
    }

    const saved: Media[] = [];
    for (const file of newFiles) {
      const path = await this.storage.save(file, entityType, entityId);
      const media = await this.repository.create(
        new Media(path, mediaType, entityType, entityId),
      );
      saved.push(media);
    }

    return saved;
  }
}
