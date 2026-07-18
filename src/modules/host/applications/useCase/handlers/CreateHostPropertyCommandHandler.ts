import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import { CommandBus } from '../../../../../shared/useCase/bus/bus';
import { CreatePropertyCommand } from '../../../../properties/applications/useCase/commands/CreatePropertyCommand';
import { PropertyOutput } from '../../../../properties/applications/dto/property.output';
import { ResolveHostUserService } from '../../services/resolve-host-user.service';
import type { CreateHostPropertyCommand } from '../commands/CreateHostPropertyCommand';

export class CreateHostPropertyCommandHandler implements ICommandHandler<
  CreateHostPropertyCommand,
  PropertyOutput
> {
  constructor(private readonly resolveHostUser: ResolveHostUserService) {}

  async execute(command: CreateHostPropertyCommand): Promise<PropertyOutput> {
    const user = await this.resolveHostUser.resolve(command.authUser.sub);

    return CommandBus.execute(
      new CreatePropertyCommand(
        { ...command.dto, ownerId: user.id! },
        command.image,
      ),
    );
  }
}
