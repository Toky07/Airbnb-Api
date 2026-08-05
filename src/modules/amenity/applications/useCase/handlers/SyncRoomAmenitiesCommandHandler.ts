import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import { AmenityOutput } from '../../dto/amenity.output';
import type { SyncRoomAmenitiesCommand } from '../commands/SyncRoomAmenitiesCommand';
import type { SyncEntityAmenitiesService } from '../../services/entity-amenities.service';

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
