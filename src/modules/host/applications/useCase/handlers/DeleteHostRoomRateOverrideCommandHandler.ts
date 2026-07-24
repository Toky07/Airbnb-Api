import { ForbiddenException } from '@nestjs/common';
import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import { CommandBus } from '../../../../../shared/useCase/bus/bus';
import { QueryBus } from '../../../../../shared/useCase/bus/query-bus';
import { DeleteRoomRateOverrideCommand } from '../../../../rooms/applications/useCase/commands/DeleteRoomRateOverrideCommand';
import { FindRoomQuery } from '../../../../rooms/applications/useCase/queries/FindRoomQuery';
import { RoomOutput } from '../../../../rooms/applications/dto/room.output';
import { ResolveHostPropertyService } from '../../services/resolve-host-property.service';
import type { DeleteHostRoomRateOverrideCommand } from '../commands/DeleteHostRoomRateOverrideCommand';

export class DeleteHostRoomRateOverrideCommandHandler implements ICommandHandler<
  DeleteHostRoomRateOverrideCommand,
  void
> {
  constructor(
    private readonly resolveHostProperty: ResolveHostPropertyService,
  ) {}

  async execute(command: DeleteHostRoomRateOverrideCommand): Promise<void> {
    await this.assertRoomOwnership(
      command.authUser,
      command.propertyId,
      command.roomId,
    );

    await CommandBus.execute(
      new DeleteRoomRateOverrideCommand(command.roomId, command.rateOverrideId),
    );
  }

  private async assertRoomOwnership(
    authUser: DeleteHostRoomRateOverrideCommand['authUser'],
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
