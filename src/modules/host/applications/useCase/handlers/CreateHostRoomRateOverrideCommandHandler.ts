import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import { CommandBus } from '../../../../../shared/useCase/bus/bus';
import { CreateRoomRateOverrideCommand } from '../../../../rooms/contracts';
import { RoomRateOverrideOutput } from '../../../../rooms/contracts';
import { AssertHostRoomOwnershipService } from '../../services/assert-host-room-ownership.service';
import type { CreateHostRoomRateOverrideCommand } from '../commands/CreateHostRoomRateOverrideCommand';

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
