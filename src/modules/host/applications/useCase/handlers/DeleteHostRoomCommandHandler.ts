import { ForbiddenException } from '@nestjs/common';
import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import { CommandBus } from '../../../../../shared/useCase/bus/bus';
import { QueryBus } from '../../../../../shared/useCase/bus/query-bus';
import { DeleteRoomCommand } from '../../../../rooms/applications/useCase/commands/DeleteRoomCommand';
import { FindRoomQuery } from '../../../../rooms/applications/useCase/queries/FindRoomQuery';
import { RoomOutput } from '../../../../rooms/applications/dto/room.output';
import { ResolveHostPropertyService } from '../../services/resolve-host-property.service';
import type { DeleteHostRoomCommand } from '../commands/DeleteHostRoomCommand';

export class DeleteHostRoomCommandHandler implements ICommandHandler<
  DeleteHostRoomCommand,
  { status: boolean }
> {
  constructor(
    private readonly resolveHostProperty: ResolveHostPropertyService,
  ) {}

  async execute(command: DeleteHostRoomCommand): Promise<{ status: boolean }> {
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

    const status = await CommandBus.execute<boolean>(
      new DeleteRoomCommand(command.roomId),
    );
    return { status };
  }
}
