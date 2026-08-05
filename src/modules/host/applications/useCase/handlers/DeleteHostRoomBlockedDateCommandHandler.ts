import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import { CommandBus } from '../../../../../shared/useCase/bus/bus';
import { DeleteRoomBlockedDateCommand } from '../../../../rooms/applications/useCase/commands/DeleteRoomBlockedDateCommand';
import { AssertHostRoomOwnershipService } from '../../services/assert-host-room-ownership.service';
import type { DeleteHostRoomBlockedDateCommand } from '../commands/DeleteHostRoomBlockedDateCommand';

export class DeleteHostRoomBlockedDateCommandHandler implements ICommandHandler<
  DeleteHostRoomBlockedDateCommand,
  { status: boolean }
> {
  constructor(
    private readonly assertHostRoomOwnership: AssertHostRoomOwnershipService,
  ) {}

  async execute(
    command: DeleteHostRoomBlockedDateCommand,
  ): Promise<{ status: boolean }> {
    await this.assertHostRoomOwnership.assert(
      command.authUser,
      command.propertyId,
      command.roomId,
    );

    return CommandBus.execute(
      new DeleteRoomBlockedDateCommand(command.roomId, command.blockedDateId),
    );
  }
}
