import { ForbiddenException } from '@nestjs/common';
import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import { CommandBus } from '../../../../../shared/useCase/bus/bus';
import { QueryBus } from '../../../../../shared/useCase/bus/query-bus';
import { DeleteRoomBlockedDateCommand } from '../../../../rooms/applications/useCase/commands/DeleteRoomBlockedDateCommand';
import { FindRoomQuery } from '../../../../rooms/applications/useCase/queries/FindRoomQuery';
import { RoomOutput } from '../../../../rooms/applications/dto/room.output';
import { ResolveHostPropertyService } from '../../services/resolve-host-property.service';
import type { DeleteHostRoomBlockedDateCommand } from '../commands/DeleteHostRoomBlockedDateCommand';

export class DeleteHostRoomBlockedDateCommandHandler implements ICommandHandler<
  DeleteHostRoomBlockedDateCommand,
  { status: boolean }
> {
  constructor(
    private readonly resolveHostProperty: ResolveHostPropertyService,
  ) {}

  async execute(
    command: DeleteHostRoomBlockedDateCommand,
  ): Promise<{ status: boolean }> {
    await this.assertRoomOwnership(
      command.authUser,
      command.propertyId,
      command.roomId,
    );

    return CommandBus.execute(
      new DeleteRoomBlockedDateCommand(command.roomId, command.blockedDateId),
    );
  }

  private async assertRoomOwnership(
    authUser: DeleteHostRoomBlockedDateCommand['authUser'],
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
