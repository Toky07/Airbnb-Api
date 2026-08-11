import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import { AmenityOutput } from '@src/modules/amenity/applications/dto/amenity.output';
import type { SyncRoomAmenitiesCommand } from '@src/modules/amenity/applications/useCase/commands/SyncRoomAmenitiesCommand';
import type { SyncEntityAmenitiesService } from '@src/modules/amenity/applications/services/entity-amenities.service';

export class SyncRoomAmenitiesCommandHandler implements ICommandHandler<
  SyncRoomAmenitiesCommand,
  AmenityOutput[]
> {
  constructor(
    private readonly syncEntityAmenitiesService: SyncEntityAmenitiesService,
  ) {}

  async execute(command: SyncRoomAmenitiesCommand): Promise<AmenityOutput[]> {
    return this.syncEntityAmenitiesService.syncRoom(
      command.roomId,
      command.dto.amenityIds ?? [],
    );
  }
}
