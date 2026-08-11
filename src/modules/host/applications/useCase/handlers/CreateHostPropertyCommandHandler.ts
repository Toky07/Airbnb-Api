import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import { CommandBus } from '@src/shared/useCase/bus/bus';
import { CreatePropertyCommand } from '@src/modules/properties/contracts';
import { PropertyOutput } from '@src/modules/properties/contracts';
import { ResolveHostUserService } from '@src/modules/host/applications/services/resolve-host-user.service';
import type { CreateHostPropertyCommand } from '@src/modules/host/applications/useCase/commands/CreateHostPropertyCommand';

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
