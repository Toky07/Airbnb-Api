import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import { CommandBus } from '../../../../../shared/useCase/bus/bus';
import type { IRoomRepository } from '../../../domain/repositories/room.repository';
import { ENTITY_TYPE } from '../../../../media/contracts';
import { DeleteMediasByEntityCommand } from '../../../../media/contracts';
import type { DeleteRoomCommand } from '../commands/DeleteRoomCommand';

export class DeleteRoomCommandHandler implements ICommandHandler<
  DeleteRoomCommand,
  boolean
> {
  constructor(private readonly repository: IRoomRepository) {}

  async execute(command: DeleteRoomCommand): Promise<boolean> {
    await CommandBus.execute(
      new DeleteMediasByEntityCommand(ENTITY_TYPE.ROOM, command.id),
    );
    return this.repository.delete(command.id);
  }
}
