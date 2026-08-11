import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import { CommandBus } from '@src/shared/useCase/bus/bus';
import { AmenityOutput } from '@src/modules/amenity/contracts';
import { SyncRoomAmenitiesCommand } from '@src/modules/amenity/contracts';
import { AssertHostRoomOwnershipService } from '@src/modules/host/applications/services/assert-host-room-ownership.service';
import type { SyncHostRoomAmenitiesCommand } from '@src/modules/host/applications/useCase/commands/SyncHostRoomAmenitiesCommand';

export class SyncHostRoomAmenitiesCommandHandler implements ICommandHandler<
  SyncHostRoomAmenitiesCommand,
  AmenityOutput[]
> {
  constructor(
    private readonly assertHostRoomOwnership: AssertHostRoomOwnershipService,
  ) {}

  async execute(
    command: SyncHostRoomAmenitiesCommand,
  ): Promise<AmenityOutput[]> {
    await this.assertHostRoomOwnership.assert(
      command.authUser,
      command.propertyId,
      command.roomId,
    );

    return CommandBus.execute(
      new SyncRoomAmenitiesCommand(command.roomId, command.dto),
    );
  }
}
