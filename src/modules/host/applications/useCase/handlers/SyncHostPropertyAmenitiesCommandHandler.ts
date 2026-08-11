import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import { CommandBus } from '../../../../../shared/useCase/bus/bus';
import { AmenityOutput } from '../../../../amenity/contracts';
import { SyncPropertyAmenitiesCommand } from '../../../../amenity/contracts';
import { ResolveHostPropertyService } from '../../services/resolve-host-property.service';
import type { SyncHostPropertyAmenitiesCommand } from '../commands/SyncHostPropertyAmenitiesCommand';

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
