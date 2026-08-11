import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import { CommandBus } from '../../../../../shared/useCase/bus/bus';
import { DeleteRoomCommand } from '../../../../rooms/contracts';
import { AssertHostRoomOwnershipService } from '../../services/assert-host-room-ownership.service';
import type { DeleteHostRoomCommand } from '../commands/DeleteHostRoomCommand';

export class DeleteHostRoomCommandHandler implements ICommandHandler<
  DeleteHostRoomCommand,
  { status: boolean }
> {
  constructor(
    private readonly assertHostRoomOwnership: AssertHostRoomOwnershipService,
  ) {}

  async execute(command: DeleteHostRoomCommand): Promise<{ status: boolean }> {
    await this.assertHostRoomOwnership.assert(
      command.authUser,
      command.propertyId,
      command.roomId,
    );

    const status = await CommandBus.execute<boolean>(
      new DeleteRoomCommand(command.roomId),
    );
    return { status };
  }
}
