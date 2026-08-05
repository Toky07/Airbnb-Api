import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import { CommandBus } from '../../../../../shared/useCase/bus/bus';
import { AmenityOutput } from '../../../../amenity/applications/dto/amenity.output';
import { SyncRoomAmenitiesCommand } from '../../../../amenity/applications/useCase/commands/SyncRoomAmenitiesCommand';
import { AssertHostRoomOwnershipService } from '../../services/assert-host-room-ownership.service';
import type { SyncHostRoomAmenitiesCommand } from '../commands/SyncHostRoomAmenitiesCommand';

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
