import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import { AmenityOutput } from '../../dto/amenity.output';
import type { SyncPropertyAmenitiesCommand } from '../commands/SyncPropertyAmenitiesCommand';
import type { SyncEntityAmenitiesService } from '../../services/entity-amenities.service';

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
