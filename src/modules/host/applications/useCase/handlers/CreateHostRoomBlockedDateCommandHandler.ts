import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import { CommandBus } from '../../../../../shared/useCase/bus/bus';
import { CreateRoomBlockedDateCommand } from '../../../../rooms/applications/useCase/commands/CreateRoomBlockedDateCommand';
import { RoomBlockedDateOutput } from '../../../../rooms/applications/dto/room-blocked-date.output';
import { AssertHostRoomOwnershipService } from '../../services/assert-host-room-ownership.service';
import type { CreateHostRoomBlockedDateCommand } from '../commands/CreateHostRoomBlockedDateCommand';

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
