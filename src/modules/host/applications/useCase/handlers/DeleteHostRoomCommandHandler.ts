import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import { CommandBus } from '@src/shared/useCase/bus/bus';
import { DeleteRoomCommand } from '@src/modules/rooms/contracts';
import { AssertHostRoomOwnershipService } from '@src/modules/host/applications/services/assert-host-room-ownership.service';
import type { DeleteHostRoomCommand } from '@src/modules/host/applications/useCase/commands/DeleteHostRoomCommand';

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
