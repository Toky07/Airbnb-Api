import { NotFoundException } from '@nestjs/common';
import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import { AMENITY_SCOPE } from '../../../domain/constants/amenity-scope.constant';
import type { IRoomRepository } from '../../../../rooms/domain/repositories/room.repository';
import type { IRoomAmenityRepository } from '../../../domain/repositories/room-amenity.repository';
import { AmenityOutput } from '../../dto/amenity.output';
import type { ResolveAmenitiesService } from '../../services/resolve-amenities.service';
import type { SyncRoomAmenitiesCommand } from '../commands/SyncRoomAmenitiesCommand';

export class SyncRoomAmenitiesCommandHandler
  implements ICommandHandler<SyncRoomAmenitiesCommand, AmenityOutput[]>
{
  constructor(
    private readonly roomRepository: IRoomRepository,
    private readonly roomAmenityRepository: IRoomAmenityRepository,
    private readonly resolveAmenitiesService: ResolveAmenitiesService,
  ) {}

  async execute(command: SyncRoomAmenitiesCommand): Promise<AmenityOutput[]> {
    const room = await this.roomRepository.findById(command.roomId);
    if (!room) {
      throw new NotFoundException('Chambre introuvable');
    }

    const amenities = await this.resolveAmenitiesService.resolveActiveAmenities(
      command.dto.amenityIds ?? [],
      AMENITY_SCOPE.ROOM,
    );

    await this.roomAmenityRepository.replaceForRoom(
      command.roomId,
      amenities.map((amenity) => amenity.id!),
    );

    return this.resolveAmenitiesService.toOutputs(amenities);
  }
}
