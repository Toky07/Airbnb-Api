import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import type { IMediaRepository } from '../../../domain/repositories/media.repository';
import type { ILocalStorageService } from '../../../services/localStorage.service';
import type { DeleteMediasByEntityCommand } from '../commands/DeleteMediasByEntityCommand';

export class DeleteMediasByEntityCommandHandler
  implements ICommandHandler<DeleteMediasByEntityCommand, void>
{
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
