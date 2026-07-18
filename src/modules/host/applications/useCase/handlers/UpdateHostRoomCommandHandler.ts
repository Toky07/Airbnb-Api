import { ForbiddenException } from '@nestjs/common';
import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import { CommandBus } from '../../../../../shared/useCase/bus/bus';
import { QueryBus } from '../../../../../shared/useCase/bus/query-bus';
import { UpdateRoomCommand } from '../../../../rooms/applications/useCase/commands/UpdateRoomCommand';
import { FindRoomQuery } from '../../../../rooms/applications/useCase/queries/FindRoomQuery';
import { RoomOutput } from '../../../../rooms/applications/dto/room.output';
import { ResolveHostPropertyService } from '../../services/resolve-host-property.service';
import type { UpdateHostRoomCommand } from '../commands/UpdateHostRoomCommand';

export class UpdateHostRoomCommandHandler implements ICommandHandler<
  UpdateHostRoomCommand,
  RoomOutput
> {
  constructor(
    private readonly resolveHostProperty: ResolveHostPropertyService,
  ) {}

  async execute(command: UpdateHostRoomCommand): Promise<RoomOutput> {
    const property = await this.resolveHostProperty.requireOwned(
      command.authUser,
      command.propertyId,
    );
    const room = await QueryBus.execute<RoomOutput | null>(
      new FindRoomQuery({ id: command.roomId }),
    );

    if (!room || room.property.id !== property.id) {
      throw new ForbiddenException('Chambre introuvable ou accès refusé.');
    }

    return CommandBus.execute(
      new UpdateRoomCommand(
        command.roomId,
        { ...command.dto, property },
        command.images,
        command.keptImages,
      ),
    );
  }
}
