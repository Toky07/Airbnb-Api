import { ForbiddenException } from '@nestjs/common';
import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import { CommandBus } from '../../../../../shared/useCase/bus/bus';
import { QueryBus } from '../../../../../shared/useCase/bus/query-bus';
import { CreateRoomBlockedDateCommand } from '../../../../rooms/applications/useCase/commands/CreateRoomBlockedDateCommand';
import { FindRoomQuery } from '../../../../rooms/applications/useCase/queries/FindRoomQuery';
import { RoomBlockedDateOutput } from '../../../../rooms/applications/dto/room-blocked-date.output';
import { RoomOutput } from '../../../../rooms/applications/dto/room.output';
import { ResolveHostPropertyService } from '../../services/resolve-host-property.service';
import type { CreateHostRoomBlockedDateCommand } from '../commands/CreateHostRoomBlockedDateCommand';

export class CreateHostRoomBlockedDateCommandHandler implements ICommandHandler<
  CreateHostRoomBlockedDateCommand,
  RoomBlockedDateOutput
> {
  constructor(
    private readonly resolveHostProperty: ResolveHostPropertyService,
  ) {}

  async execute(
    command: CreateHostRoomBlockedDateCommand,
  ): Promise<RoomBlockedDateOutput> {
    await this.assertRoomOwnership(
      command.authUser,
      command.propertyId,
      command.roomId,
    );

    return CommandBus.execute(
      new CreateRoomBlockedDateCommand(command.roomId, command.dto),
    );
  }

  private async assertRoomOwnership(
    authUser: CreateHostRoomBlockedDateCommand['authUser'],
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
