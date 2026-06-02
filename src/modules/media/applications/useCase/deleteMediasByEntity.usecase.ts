import { Inject } from '@nestjs/common';
import type { EntityType } from '../../constant';
import type { IMediaRepository } from '../../domain/repositories/media.repository';
import { MEDIA_REPOSITORY } from '../../infrastructure/repositories/media.repository';
import {
  LOCAL_STORAGE_SERVICE,
  type ILocalStorageService,
} from '../../services/localStorage.service';

export class DeleteMediasByEntityUseCase {
  constructor(
    @Inject(MEDIA_REPOSITORY) private readonly repository: IMediaRepository,
    @Inject(LOCAL_STORAGE_SERVICE)
    private readonly storage: ILocalStorageService,
  ) {}

  async execute(entityType: EntityType, entityId: number): Promise<void> {
    const removed = await this.repository.deleteByEntity(entityType, entityId);
    await this.storage.deleteMany(removed.map((media) => media.path));
  }
}
