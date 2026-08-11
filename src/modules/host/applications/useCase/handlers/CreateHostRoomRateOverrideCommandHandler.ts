import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import { CommandBus } from '@src/shared/useCase/bus/bus';
import { CreateRoomRateOverrideCommand } from '@src/modules/rooms/contracts';
import { RoomRateOverrideOutput } from '@src/modules/rooms/contracts';
import { AssertHostRoomOwnershipService } from '@src/modules/host/applications/services/assert-host-room-ownership.service';
import type { CreateHostRoomRateOverrideCommand } from '@src/modules/host/applications/useCase/commands/CreateHostRoomRateOverrideCommand';

export class CreateHostRoomRateOverrideCommandHandler implements ICommandHandler<
  CreateHostRoomRateOverrideCommand,
  RoomRateOverrideOutput
> {
  constructor(
    private readonly assertHostRoomOwnership: AssertHostRoomOwnershipService,
  ) {}

  async execute(
    command: CreateHostRoomRateOverrideCommand,
  ): Promise<RoomRateOverrideOutput> {
    await this.assertHostRoomOwnership.assert(
      command.authUser,
      command.propertyId,
      command.roomId,
    );

    return CommandBus.execute(
      new CreateRoomRateOverrideCommand(command.roomId, command.dto),
    );
  }
}
