import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import type { IMediaRepository } from '@src/modules/media/domain/repositories/media.repository';
import type { ILocalStorageService } from '@src/modules/media/services/localStorage.service';
import type { DeleteMediasByEntityCommand } from '@src/modules/media/applications/useCase/commands/DeleteMediasByEntityCommand';

export class DeleteMediasByEntityCommandHandler implements ICommandHandler<
  DeleteMediasByEntityCommand,
  void
> {
  constructor(
    private readonly repository: IMediaRepository,
    private readonly storage: ILocalStorageService,
  ) {}

  async execute(command: DeleteMediasByEntityCommand): Promise<void> {
    const removed = await this.repository.deleteByEntity(
      command.entityType,
      command.entityId,
    );
    await this.storage.deleteMany(removed.map((media) => media.path));
  }
}
