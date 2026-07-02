import type { IMediaRepository } from './domain/repositories/media.repository';
import type { ILocalStorageService } from './services/localStorage.service';
import { DeleteMediasByEntityCommandHandler } from './applications/useCase/handlers/DeleteMediasByEntityCommandHandler';
import { SaveEntityMediasCommandHandler } from './applications/useCase/handlers/SaveEntityMediasCommandHandler';
import { SyncEntityMediasCommandHandler } from './applications/useCase/handlers/SyncEntityMediasCommandHandler';
import { GetMediasByEntityQueryHandler } from './applications/useCase/handlers/GetMediasByEntityQueryHandler';

export class MediaBootstrap {
  static create(deps: {
    mediaRepository: IMediaRepository;
    storage: ILocalStorageService;
  }) {
    const deleteMediasByEntityCommandHandler =
      new DeleteMediasByEntityCommandHandler(deps.mediaRepository, deps.storage);

    return {
      deleteMediasByEntityCommandHandler,
      saveEntityMediasCommandHandler: new SaveEntityMediasCommandHandler(
        deps.mediaRepository,
        deps.storage,
        deleteMediasByEntityCommandHandler,
      ),
      syncEntityMediasCommandHandler: new SyncEntityMediasCommandHandler(
        deps.mediaRepository,
        deps.storage,
      ),
      getMediasByEntityQueryHandler: new GetMediasByEntityQueryHandler(
        deps.mediaRepository,
      ),
    };
  }
}
