import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import { CommandBus } from '../../../../../shared/useCase/bus/bus';
import { UpdatePropertyCommand } from '../../../../properties/applications/useCase/commands/UpdatePropertyCommand';
import { PropertyOutput } from '../../../../properties/applications/dto/property.output';
import { ResolveHostPropertyService } from '../../services/resolve-host-property.service';
import { ResolveHostUserService } from '../../services/resolve-host-user.service';
import type { UpdateHostPropertyCommand } from '../commands/UpdateHostPropertyCommand';

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
