import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import { CommandBus } from '@src/shared/useCase/bus/bus';
import { UpdatePropertyCommand } from '@src/modules/properties/contracts';
import { PropertyOutput } from '@src/modules/properties/contracts';
import { ResolveHostPropertyService } from '@src/modules/host/applications/services/resolve-host-property.service';
import { ResolveHostUserService } from '@src/modules/host/applications/services/resolve-host-user.service';
import type { UpdateHostPropertyCommand } from '@src/modules/host/applications/useCase/commands/UpdateHostPropertyCommand';

export class UpdateHostPropertyCommandHandler implements ICommandHandler<
  UpdateHostPropertyCommand,
  PropertyOutput
> {
  constructor(
    private readonly resolveHostProperty: ResolveHostPropertyService,
    private readonly resolveHostUser: ResolveHostUserService,
  ) {}

  async execute(command: UpdateHostPropertyCommand): Promise<PropertyOutput> {
    const user = await this.resolveHostUser.resolve(command.authUser.sub);
    await this.resolveHostProperty.requireOwned(
      command.authUser,
      command.propertyId,
    );

    return CommandBus.execute(
      new UpdatePropertyCommand(
        command.propertyId,
        { ...command.dto, ownerId: user.id! },
        command.image,
      ),
    );
  }
}
