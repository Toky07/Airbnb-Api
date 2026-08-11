import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import { CommandBus } from '@src/shared/useCase/bus/bus';
import { DeleteRoomBlockedDateCommand } from '@src/modules/rooms/contracts';
import { AssertHostRoomOwnershipService } from '@src/modules/host/applications/services/assert-host-room-ownership.service';
import type { DeleteHostRoomBlockedDateCommand } from '@src/modules/host/applications/useCase/commands/DeleteHostRoomBlockedDateCommand';

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
