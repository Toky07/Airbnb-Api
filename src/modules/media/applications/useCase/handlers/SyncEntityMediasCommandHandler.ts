import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import { ENTITY_MEDIA_LIMITS, MEDIA_TYPE } from '../../../constant';
import { Media } from '../../../domain/entities/media.entity';
import type { IMediaRepository } from '../../../domain/repositories/media.repository';
import type { ILocalStorageService } from '../../../services/localStorage.service';
import { toSaveMediaContext } from '../../../utils/build-upload-path';
import type { SyncEntityMediasCommand } from '../commands/SyncEntityMediasCommand';

export class SyncEntityMediasCommandHandler implements ICommandHandler<
  SyncEntityMediasCommand,
  Media[]
> {
  constructor(
    private readonly repository: IMediaRepository,
    private readonly storage: ILocalStorageService,
  ) {}

  async execute(command: SyncEntityMediasCommand): Promise<Media[]> {
    const newFiles = command.options.newFiles ?? [];
    const keptSet = new Set(command.options.keptPaths);
    const existing = await this.repository.findByEntity(
      command.entityType,
      command.entityId,
    );

    for (const media of existing) {
      if (keptSet.has(media.path)) {
        continue;
      }
      if (media.id != null) {
        await this.repository.delete(media.id);
      }
      await this.storage.delete(media.path);
    }

    const remainingCount = existing.filter((media) =>
      keptSet.has(media.path),
    ).length;
    const maxFiles = ENTITY_MEDIA_LIMITS[command.entityType];
    const slotsLeft = maxFiles - remainingCount;

    if (newFiles.length > slotsLeft) {
      throw new Error(
        `Maximum ${maxFiles} media file(s) allowed for entity type "${command.entityType}"`,
      );
    }

    const context = toSaveMediaContext(
      command.entityType,
      command.entityId,
      command.propertyId,
    );

    const saved: Media[] = [];
    for (const file of newFiles) {
      const path = await this.storage.save(file, context);
      const media = await this.repository.create(
        new Media(
          path,
          command.mediaType ?? MEDIA_TYPE.IMAGE,
          command.entityType,
          command.entityId,
        ),
      );
      saved.push(media);
    }

    return saved;
  }
}
