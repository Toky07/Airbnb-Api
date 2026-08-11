import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import { CommandBus } from '@src/shared/useCase/bus/bus';
import { AmenityOutput } from '@src/modules/amenity/contracts';
import { SyncPropertyAmenitiesCommand } from '@src/modules/amenity/contracts';
import { ResolveHostPropertyService } from '@src/modules/host/applications/services/resolve-host-property.service';
import type { SyncHostPropertyAmenitiesCommand } from '@src/modules/host/applications/useCase/commands/SyncHostPropertyAmenitiesCommand';

export class SyncHostPropertyAmenitiesCommandHandler implements ICommandHandler<
  SyncHostPropertyAmenitiesCommand,
  AmenityOutput[]
> {
  constructor(
    private readonly resolveHostProperty: ResolveHostPropertyService,
  ) {}

  async execute(
    command: SyncHostPropertyAmenitiesCommand,
  ): Promise<AmenityOutput[]> {
    await this.resolveHostProperty.requireOwned(
      command.authUser,
      command.propertyId,
    );
    return CommandBus.execute(
      new SyncPropertyAmenitiesCommand(command.propertyId, command.dto),
    );
  }
}
