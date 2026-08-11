import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import { CommandBus } from '@src/shared/useCase/bus/bus';
import type { IPropertyRepository } from '@src/modules/properties/domain/repositories/property.repository';
import { ENTITY_TYPE } from '@src/modules/media/contracts';
import { DeleteMediasByEntityCommand } from '@src/modules/media/contracts';
import type { DeletePropertyCommand } from '@src/modules/properties/applications/useCase/commands/DeletePropertyCommand';

export class DeletePropertyCommandHandler implements ICommandHandler<
  DeletePropertyCommand,
  boolean
> {
  constructor(private readonly repository: IPropertyRepository) {}

  async execute(command: DeletePropertyCommand): Promise<boolean> {
    const property = await this.repository.findById(command.id);

    if (!property) {
      throw new Error('Property not found');
    }

    await CommandBus.execute(
      new DeleteMediasByEntityCommand(ENTITY_TYPE.PROPERTY, command.id),
    );

    return this.repository.delete(command.id);
  }
}
