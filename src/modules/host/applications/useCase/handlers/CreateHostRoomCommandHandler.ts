import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import { CommandBus } from '@src/shared/useCase/bus/bus';
import { CreateRoomCommand } from '@src/modules/rooms/contracts';
import { RoomOutput } from '@src/modules/rooms/contracts';
import { ResolveHostPropertyService } from '@src/modules/host/applications/services/resolve-host-property.service';
import type { CreateHostRoomCommand } from '@src/modules/host/applications/useCase/commands/CreateHostRoomCommand';

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
