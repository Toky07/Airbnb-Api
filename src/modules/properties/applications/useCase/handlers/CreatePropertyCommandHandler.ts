import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import { CommandBus } from '../../../../../shared/useCase/bus/bus';
import type { IPropertyRepository } from '../../../domain/repositories/property.repository';
import { Property } from '../../../domain/entities/property.entity';
import { PropertyOutput } from '../../dto/property.output';
import { ENTITY_TYPE } from '../../../../media/constant';
import { SaveEntityMediasCommand } from '../../../../media/applications/useCase/commands/SaveEntityMediasCommand';
import type { PropertyMediaPresenter } from '../../presenters/property-media.presenter';
import type { CreatePropertyCommand } from '../commands/CreatePropertyCommand';

export class CreatePropertyCommandHandler implements ICommandHandler<
  CreatePropertyCommand,
  PropertyOutput
> {
  constructor(
    private readonly repository: IPropertyRepository,
    private readonly presenter: PropertyMediaPresenter,
  ) {}

  async execute(command: CreatePropertyCommand): Promise<PropertyOutput> {
    const property = new Property(command.dto);
    const newProperty = await this.repository.create(property);

    if (command.image) {
      await CommandBus.execute(
        new SaveEntityMediasCommand(ENTITY_TYPE.PROPERTY, newProperty.id!, [
          command.image,
        ]),
      );
    }

    return this.presenter.toOutput(newProperty);
  }
}
