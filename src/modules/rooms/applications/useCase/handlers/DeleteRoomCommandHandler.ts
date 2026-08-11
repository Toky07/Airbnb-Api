import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import { CommandBus } from '@src/shared/useCase/bus/bus';
import type { IRoomRepository } from '@src/modules/rooms/domain/repositories/room.repository';
import { ENTITY_TYPE } from '@src/modules/media/contracts';
import { DeleteMediasByEntityCommand } from '@src/modules/media/contracts';
import type { DeleteRoomCommand } from '@src/modules/rooms/applications/useCase/commands/DeleteRoomCommand';

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
