import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import { CommandBus } from '../../../../../shared/useCase/bus/bus';
import { UpdateRoomCommand } from '../../../../rooms/contracts';
import { RoomOutput } from '../../../../rooms/contracts';
import { AssertHostRoomOwnershipService } from '../../services/assert-host-room-ownership.service';
import { ResolveHostPropertyService } from '../../services/resolve-host-property.service';
import type { UpdateHostRoomCommand } from '../commands/UpdateHostRoomCommand';

export class UpdateHostRoomCommandHandler implements ICommandHandler<
  UpdateHostRoomCommand,
  RoomOutput
> {
  constructor(
    private readonly resolveHostProperty: ResolveHostPropertyService,
    private readonly assertHostRoomOwnership: AssertHostRoomOwnershipService,
  ) {}

  async execute(command: UpdateHostRoomCommand): Promise<RoomOutput> {
    await this.assertHostRoomOwnership.assert(
      command.authUser,
      command.propertyId,
      command.roomId,
    );

    const property = await this.resolveHostProperty.requireOwned(
      command.authUser,
      command.propertyId,
    );

    return CommandBus.execute(
      new UpdateRoomCommand(
        command.roomId,
        { ...command.dto, property },
        command.images,
        command.keptImages,
      ),
    );
  }
}
