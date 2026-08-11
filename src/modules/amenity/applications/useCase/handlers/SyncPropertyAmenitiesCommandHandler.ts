import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import { AmenityOutput } from '@src/modules/amenity/applications/dto/amenity.output';
import type { SyncPropertyAmenitiesCommand } from '@src/modules/amenity/applications/useCase/commands/SyncPropertyAmenitiesCommand';
import type { SyncEntityAmenitiesService } from '@src/modules/amenity/applications/services/sync-entity-amenities.service';

export class SyncPropertyAmenitiesCommandHandler implements ICommandHandler<
  SyncPropertyAmenitiesCommand,
  AmenityOutput[]
> {
  constructor(
    private readonly syncEntityAmenitiesService: SyncEntityAmenitiesService,
  ) {}

  async execute(
    command: SyncPropertyAmenitiesCommand,
  ): Promise<AmenityOutput[]> {
    return this.syncEntityAmenitiesService.syncProperty(
      command.propertyId,
      command.dto.amenityIds ?? [],
    );
  }
}
