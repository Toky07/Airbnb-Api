import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import { CommandBus } from '@src/shared/useCase/bus/bus';
import { UpdateRoomCommand } from '@src/modules/rooms/contracts';
import { RoomOutput } from '@src/modules/rooms/contracts';
import { AssertHostRoomOwnershipService } from '@src/modules/host/applications/services/assert-host-room-ownership.service';
import { ResolveHostPropertyService } from '@src/modules/host/applications/services/resolve-host-property.service';
import type { UpdateHostRoomCommand } from '@src/modules/host/applications/useCase/commands/UpdateHostRoomCommand';

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
