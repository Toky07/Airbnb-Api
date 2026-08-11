import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import { CommandBus } from '@src/shared/useCase/bus/bus';
import { CreateRoomBlockedDateCommand } from '@src/modules/rooms/contracts';
import { RoomBlockedDateOutput } from '@src/modules/rooms/contracts';
import { AssertHostRoomOwnershipService } from '@src/modules/host/applications/services/assert-host-room-ownership.service';
import type { CreateHostRoomBlockedDateCommand } from '@src/modules/host/applications/useCase/commands/CreateHostRoomBlockedDateCommand';

export class CreateHostRoomBlockedDateCommandHandler implements ICommandHandler<
  CreateHostRoomBlockedDateCommand,
  RoomBlockedDateOutput
> {
  constructor(
    private readonly assertHostRoomOwnership: AssertHostRoomOwnershipService,
  ) {}

  async execute(
    command: CreateHostRoomBlockedDateCommand,
  ): Promise<RoomBlockedDateOutput> {
    await this.assertHostRoomOwnership.assert(
      command.authUser,
      command.propertyId,
      command.roomId,
    );

    return CommandBus.execute(
      new CreateRoomBlockedDateCommand(command.roomId, command.dto),
    );
  }
}
