import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import { CommandBus } from '../../../../../shared/useCase/bus/bus';
import { DeleteRoomRateOverrideCommand } from '../../../../rooms/contracts';
import { AssertHostRoomOwnershipService } from '../../services/assert-host-room-ownership.service';
import type { DeleteHostRoomRateOverrideCommand } from '../commands/DeleteHostRoomRateOverrideCommand';

export class DeleteHostRoomRateOverrideCommandHandler implements ICommandHandler<
  DeleteHostRoomRateOverrideCommand,
  { status: boolean }
> {
  constructor(
    private readonly assertHostRoomOwnership: AssertHostRoomOwnershipService,
  ) {}

  async execute(
    command: DeleteHostRoomRateOverrideCommand,
  ): Promise<{ status: boolean }> {
    await this.assertHostRoomOwnership.assert(
      command.authUser,
      command.propertyId,
      command.roomId,
    );

    return CommandBus.execute(
      new DeleteRoomRateOverrideCommand(command.roomId, command.rateOverrideId),
    );
  }
}
