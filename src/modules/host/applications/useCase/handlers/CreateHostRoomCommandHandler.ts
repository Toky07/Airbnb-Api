import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import { CommandBus } from '../../../../../shared/useCase/bus/bus';
import { CreateRoomCommand } from '../../../../rooms/contracts';
import { RoomOutput } from '../../../../rooms/contracts';
import { ResolveHostPropertyService } from '../../services/resolve-host-property.service';
import type { CreateHostRoomCommand } from '../commands/CreateHostRoomCommand';

export class CreateHostRoomCommandHandler implements ICommandHandler<
  CreateHostRoomCommand,
  RoomOutput
> {
  constructor(
    private readonly resolveHostProperty: ResolveHostPropertyService,
  ) {}

  async execute(command: CreateHostRoomCommand): Promise<RoomOutput> {
    const property = await this.resolveHostProperty.requireOwned(
      command.authUser,
      command.propertyId,
    );

    return CommandBus.execute(
      new CreateRoomCommand({ ...command.dto, property }, command.images),
    );
  }
}
