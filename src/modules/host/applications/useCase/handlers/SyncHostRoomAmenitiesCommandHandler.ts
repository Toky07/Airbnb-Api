import { ForbiddenException } from '@nestjs/common';
import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import { CommandBus } from '../../../../../shared/useCase/bus/bus';
import { QueryBus } from '../../../../../shared/useCase/bus/query-bus';
import { AmenityOutput } from '../../../../amenity/applications/dto/amenity.output';
import { SyncRoomAmenitiesCommand } from '../../../../amenity/applications/useCase/commands/SyncRoomAmenitiesCommand';
import { FindRoomQuery } from '../../../../rooms/applications/useCase/queries/FindRoomQuery';
import { RoomOutput } from '../../../../rooms/applications/dto/room.output';
import { ResolveHostPropertyService } from '../../services/resolve-host-property.service';
import type { SyncHostRoomAmenitiesCommand } from '../commands/SyncHostRoomAmenitiesCommand';

export class SyncHostRoomAmenitiesCommandHandler implements ICommandHandler<
  SyncHostRoomAmenitiesCommand,
  AmenityOutput[]
> {
  constructor(
    private readonly resolveHostProperty: ResolveHostPropertyService,
  ) {}

  async execute(
    command: SyncHostRoomAmenitiesCommand,
  ): Promise<AmenityOutput[]> {
    await this.assertRoomOwnership(
      command.authUser,
      command.propertyId,
      command.roomId,
    );
    return CommandBus.execute(
      new SyncRoomAmenitiesCommand(command.roomId, command.dto),
    );
  }

  private async assertRoomOwnership(
    authUser: SyncHostRoomAmenitiesCommand['authUser'],
    propertyId: number,
    roomId: number,
  ) {
    const property = await this.resolveHostProperty.requireOwned(
      authUser,
      propertyId,
    );
    const room = await QueryBus.execute<RoomOutput | null>(
      new FindRoomQuery({ id: roomId }),
    );

    if (!room || room.property.id !== property.id) {
      throw new ForbiddenException('Chambre introuvable ou accès refusé.');
    }
  }
}
