import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import { CommandBus } from '../../../../../shared/useCase/bus/bus';
import type { IPropertyRepository } from '../../../domain/repositories/property.repository';
import { ENTITY_TYPE } from '../../../../media/constant';
import { DeleteMediasByEntityCommand } from '../../../../media/applications/useCase/commands/DeleteMediasByEntityCommand';
import type { DeletePropertyCommand } from '../commands/DeletePropertyCommand';

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
