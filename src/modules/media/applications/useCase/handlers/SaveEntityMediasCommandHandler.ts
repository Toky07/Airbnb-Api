import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import {
  ENTITY_MEDIA_LIMITS,
  MEDIA_TYPE,
} from '../../../constant';
import { Media } from '../../../domain/entities/media.entity';
import type { IMediaRepository } from '../../../domain/repositories/media.repository';
import type { ILocalStorageService } from '../../../services/localStorage.service';
import { toSaveMediaContext } from '../../../utils/build-upload-path';
import type { DeleteMediasByEntityCommandHandler } from './DeleteMediasByEntityCommandHandler';
import type { SaveEntityMediasCommand } from '../commands/SaveEntityMediasCommand';
import { DeleteMediasByEntityCommand } from '../commands/DeleteMediasByEntityCommand';

export class SaveEntityMediasCommandHandler
  implements ICommandHandler<SaveEntityMediasCommand, Media[]>
{
  constructor(
    private readonly repository: IMediaRepository,
    private readonly storage: ILocalStorageService,
    private readonly deleteMediasByEntity: DeleteMediasByEntityCommandHandler,
  ) {}

  async execute(command: SaveEntityMediasCommand): Promise<Media[]> {
    if (command.files.length === 0) {
      return [];
    }

    const maxFiles = ENTITY_MEDIA_LIMITS[command.entityType];
    if (command.files.length > maxFiles) {
      throw new Error(
        `Maximum ${maxFiles} media file(s) allowed for entity type "${command.entityType}"`,
      );
    }

    await this.deleteMediasByEntity.execute(
      new DeleteMediasByEntityCommand(command.entityType, command.entityId),
    );

    const context = toSaveMediaContext(
      command.entityType,
      command.entityId,
      command.propertyId,
    );

    const saved: Media[] = [];
    for (const file of command.files) {
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
