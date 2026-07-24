import { ForbiddenException } from '@nestjs/common';
import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import { CommandBus } from '../../../../../shared/useCase/bus/bus';
import { QueryBus } from '../../../../../shared/useCase/bus/query-bus';
import { CreateRoomRateOverrideCommand } from '../../../../rooms/applications/useCase/commands/CreateRoomRateOverrideCommand';
import { FindRoomQuery } from '../../../../rooms/applications/useCase/queries/FindRoomQuery';
import { RoomRateOverrideOutput } from '../../../../rooms/applications/dto/room-rate-override.output';
import { RoomOutput } from '../../../../rooms/applications/dto/room.output';
import { ResolveHostPropertyService } from '../../services/resolve-host-property.service';
import type { CreateHostRoomRateOverrideCommand } from '../commands/CreateHostRoomRateOverrideCommand';

export class CreateHostRoomRateOverrideCommandHandler implements ICommandHandler<
  CreateHostRoomRateOverrideCommand,
  RoomRateOverrideOutput
> {
  constructor(
    private readonly resolveHostProperty: ResolveHostPropertyService,
  ) {}

  async execute(
    command: CreateHostRoomRateOverrideCommand,
  ): Promise<RoomRateOverrideOutput> {
    await this.assertRoomOwnership(
      command.authUser,
      command.propertyId,
      command.roomId,
    );

    return CommandBus.execute(
      new CreateRoomRateOverrideCommand(command.roomId, command.dto),
    );
  }

  private async assertRoomOwnership(
    authUser: CreateHostRoomRateOverrideCommand['authUser'],
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
